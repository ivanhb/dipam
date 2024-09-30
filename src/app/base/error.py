
class ERR_DIPAM:
    def __init__(
            self,
            msg = None
        ):
        """
        value: a string that describes the error in the dipam data
        """
        self.msg = msg

    def set(self, s):
        self.msg = s
