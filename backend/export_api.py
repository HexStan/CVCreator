import os
import sys
import tempfile

from flask import Blueprint, request, jsonify, send_file, session

from config import FONTS_DIR

export_bp = Blueprint('export', __name__)


def _ensure_gtk_path():
    if sys.platform != 'win32':
        return
    path_entries = os.environ.get('PATH', '').split(';')
    filtered = [p for p in path_entries if 'qemu' not in p.lower()]
    os.environ['PATH'] = ';'.join(filtered)

    def _add_dir(d):
        try:
            os.add_dll_directory(d)
        except Exception:
            os.environ['PATH'] = d + ';' + os.environ.get('PATH', '')

    gtk_bin = os.path.join(os.path.dirname(sys.executable), 'Library', 'bin')
    if os.path.isdir(gtk_bin):
        _add_dir(gtk_bin)
        return

    for p in [r'C:\msys64\mingw64\bin', r'C:\msys64\mingw32\bin', r'C:\Program Files\GTK3-Runtime\bin']:
        if os.path.isdir(p):
            _add_dir(p)


def get_current_user_id():
    return session.get('user_id')


def require_user():
    user_id = get_current_user_id()
    if not user_id:
        return None, (jsonify({'error': '未登录'}), 401)
    return user_id, None


@export_bp.route('/pdf', methods=['POST'])
def export_pdf():
    user_id, err = require_user()
    if err:
        return err

    data = request.get_json(silent=True) or {}
    html = data.get('html', '')
    styles = data.get('styles', '')
    page_width = data.get('pageWidth', 210)
    page_height = data.get('pageHeight', 297)
    margin_top = data.get('marginTop', 15)
    margin_bottom = data.get('marginBottom', 15)
    margin_left = data.get('marginLeft', 15)
    margin_right = data.get('marginRight', 15)
    user_fonts = data.get('fonts', [])

    css = f"""
@page {{
    size: {page_width}mm {page_height}mm;
    margin: {margin_top}mm {margin_right}mm {margin_bottom}mm {margin_left}mm;
}}
body {{
    margin: 0;
    padding: 0;
}}
{styles}
"""

    font_faces = ''
    if user_fonts:
        for font in user_fonts:
            fonts_dir = os.path.join(FONTS_DIR, user_id)
            font_path = os.path.join(fonts_dir, font['filename'])
            if os.path.exists(font_path):
                font_faces += f"""
@font-face {{
    font-family: "{font['family']}";
    src: url("file:///{font_path.replace(chr(92), '/')}");
}}
"""

    full_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
{css}
{font_faces}
body {{ font-family: {data.get('fontFamily', 'sans-serif')}; }}
</style>
</head>
<body>
{html}
</body>
</html>"""

    try:
        _ensure_gtk_path()
        from weasyprint import HTML

        tmp = tempfile.NamedTemporaryFile(suffix='.pdf', delete=False)
        try:
            HTML(string=full_html).write_pdf(tmp.name)
            tmp.close()
            return send_file(tmp.name, mimetype='application/pdf', as_attachment=True, download_name='resume.pdf')
        finally:
            try:
                os.unlink(tmp.name)
            except OSError:
                pass
    except ImportError:
        return jsonify({'error': 'PDF 生成功能未安装 weasyprint'}), 500
    except Exception as e:
        return jsonify({'error': f'PDF 生成失败: {str(e)}'}), 500
