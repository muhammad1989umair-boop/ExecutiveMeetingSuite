import tkinter as tk


class Calculator:
    def __init__(self, root):
        self.root = root
        self.root.title("Calculator")
        self.root.resizable(False, False)
        self.expression = ""
        self._build_ui()

    def _build_ui(self):
        display = tk.Entry(
            self.root,
            font=("Segoe UI", 22),
            justify="right",
            bd=0,
            bg="#1e1e2e",
            fg="#cdd6f4",
            insertbackground="#cdd6f4",
        )
        display.grid(row=0, column=0, columnspan=4, sticky="nsew", ipady=18, padx=2, pady=2)
        self.display = display

        buttons = [
            ("C",  1, 0, "#f38ba8", "#1e1e2e"),
            ("±",  1, 1, "#6c7086", "#cdd6f4"),
            ("%",  1, 2, "#6c7086", "#cdd6f4"),
            ("÷",  1, 3, "#fab387", "#1e1e2e"),
            ("7",  2, 0, "#313244", "#cdd6f4"),
            ("8",  2, 1, "#313244", "#cdd6f4"),
            ("9",  2, 2, "#313244", "#cdd6f4"),
            ("×",  2, 3, "#fab387", "#1e1e2e"),
            ("4",  3, 0, "#313244", "#cdd6f4"),
            ("5",  3, 1, "#313244", "#cdd6f4"),
            ("6",  3, 2, "#313244", "#cdd6f4"),
            ("-",  3, 3, "#fab387", "#1e1e2e"),
            ("1",  4, 0, "#313244", "#cdd6f4"),
            ("2",  4, 1, "#313244", "#cdd6f4"),
            ("3",  4, 2, "#313244", "#cdd6f4"),
            ("+",  4, 3, "#fab387", "#1e1e2e"),
            ("0",  5, 0, "#313244", "#cdd6f4"),
            (".",  5, 2, "#313244", "#cdd6f4"),
            ("=",  5, 3, "#a6e3a1", "#1e1e2e"),
        ]

        for (text, row, col, bg, fg) in buttons:
            colspan = 2 if text == "0" else 1
            btn = tk.Button(
                self.root,
                text=text,
                font=("Segoe UI", 16, "bold"),
                bg=bg,
                fg=fg,
                activebackground=fg,
                activeforeground=bg,
                bd=0,
                padx=10,
                pady=18,
                command=lambda t=text: self._on_click(t),
            )
            btn.grid(row=row, column=col, columnspan=colspan, sticky="nsew", padx=2, pady=2)

        for i in range(6):
            self.root.rowconfigure(i, weight=1)
        for j in range(4):
            self.root.columnconfigure(j, weight=1)

        self.root.configure(bg="#181825")
        self.root.bind("<Key>", self._on_key)

    def _on_click(self, key):
        if key == "C":
            self.expression = ""
        elif key == "=":
            self._evaluate()
            return
        elif key == "±":
            self._negate()
            return
        elif key == "%":
            self._percent()
            return
        elif key == "÷":
            self.expression += "/"
        elif key == "×":
            self.expression += "*"
        else:
            self.expression += key
        self._refresh()

    def _on_key(self, event):
        key_map = {"Return": "=", "BackSpace": None, "Escape": "C", "/": "÷", "*": "×"}
        k = event.char
        if event.keysym in key_map:
            mapped = key_map[event.keysym]
            if event.keysym == "BackSpace":
                self.expression = self.expression[:-1]
                self._refresh()
            elif mapped:
                self._on_click(mapped)
        elif k in "0123456789.+-":
            self._on_click(k)
        elif k == "/":
            self._on_click("÷")
        elif k == "*":
            self._on_click("×")
        elif k == "%":
            self._on_click("%")

    def _evaluate(self):
        try:
            result = eval(self.expression)  # safe: expression only contains digits and operators
            self.expression = str(int(result) if result == int(result) else result)
        except Exception:
            self.expression = "Error"
        self._refresh()

    def _negate(self):
        try:
            val = float(self.expression)
            val = -val
            self.expression = str(int(val) if val == int(val) else val)
        except Exception:
            pass
        self._refresh()

    def _percent(self):
        try:
            val = float(self.expression)
            val = val / 100
            self.expression = str(int(val) if val == int(val) else val)
        except Exception:
            pass
        self._refresh()

    def _refresh(self):
        self.display.config(state="normal")
        self.display.delete(0, tk.END)
        self.display.insert(0, self.expression)
        self.display.config(state="readonly")


if __name__ == "__main__":
    root = tk.Tk()
    root.geometry("320x480")
    Calculator(root)
    root.mainloop()
