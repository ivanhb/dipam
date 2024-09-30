from app.base.view_handler import VIEW_DIPAM_HANDLER

class VIEWH_INPUT_BOX(VIEW_DIPAM_HANDLER):
    def __init__(self):
        super().__init__(
            id = "input-text",
            type = "DYNAMIC"
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
