from app.base.view_handler import VIEW_DIPAM_HANDLER

class VIEWH_INPUT_BOX(VIEW_DIPAM_HANDLER):
    def __init__(self):
        super().__init__(
            id = "input-text",
            type = "DYNAMIC",
            html_content = """
            <div class="input-group">
              <div class="input-group-prepend">
                <label class="input-group-text">${title}</label>
              </div>
              <input ${text_palceholder} data-id="${id}" data-att-value="`+k_attribute+`" type="text" ></input>
            </div>
            """
        )

    def value2view(self, value):
        return value

    def value2backend(self, value):
        return value





class VIEWH_INPUT_FILE(VIEW_DIPAM_HANDLER):
    def __init__(self,
        f_ext = []
    ):
        """
        @param:
            <f_ext>: to specify the file extension(s) (e.g., csv, txt, etc)
        """
        super().__init__(
            id = "file-input",
            type = "DYNAMIC"
        )
        self.f_ext = f_ext

    def value2view(self, value):
        return value

    def value2backend(self, value):
        return value
