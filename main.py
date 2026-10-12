import json
import os
import subprocess
import sys
import webview

CREATE_NO_WINDOW = 0x08000000


def resource_path(relative_path):
    base_path = getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_path, relative_path)


class Api:
    def list_printers(self):
        """Pergunta ao Windows quais impressoras estão instaladas/conectadas agora."""
        if sys.platform != "win32":
            return []
        command = (
            "Get-CimInstance -ClassName Win32_Printer | "
            "Select-Object Name, Default | ConvertTo-Json -Compress"
        )
        try:
            result = subprocess.run(
                ["powershell", "-NoProfile", "-NonInteractive", "-Command", command],
                stdin=subprocess.DEVNULL,
                capture_output=True,
                text=True,
                timeout=10,
                creationflags=CREATE_NO_WINDOW,
            )
            data = json.loads(result.stdout or "[]")
            if isinstance(data, dict):
                data = [data]
            return [{"name": p.get("Name", ""), "default": bool(p.get("Default"))} for p in data if p.get("Name")]
        except Exception:
            return []


def main():
    index_path = resource_path("index.html")
    webview.create_window(
        "ETIQMAIS",
        index_path,
        js_api=Api(),
        width=1360,
        height=860,
        min_size=(1000, 650),
        text_select=True,
    )
    webview.start()


if __name__ == "__main__":
    main()
