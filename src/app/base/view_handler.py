
class VIEW_DIPAM_HANDLER:
    """
    @param
    + <id>: the identifier of the DIPAM view component.
        This value is taken from the index of the available view components, defined in config.yaml
    + <type>: could be either "STATIC" or "DYNAMIC".
        "STATIC" elements are not meant to handle data getting from the interface
    """
    def __init__(
        self,
        id,
        type = "STATIC",
        html_content = None,
        settings = None
    ):
        self.id = id
        self.type = type
        self.html_content = html_content
        self.settings = settings


    def check_value_format(self, value):
        """
        [REQ] Must be overwriten if needed
        ----------------------------------
        This method defines how the value format accepted by the view;
        @param:
            <value>: the value to check
        @return:
            True/False if <value>, respectively, follows or does not follow the expected format.
        """
        return True


    def gen_data(self, value):
        """
        [NOT-OVERWRITABLE]
        """
        data = {
            "id": self.id,
            "type": self.type,
            "html_dom": self.html_content
        }
        data["value"] = self.value2view(value)
        return data

    def value2view(self, value):
        """
        [REQ] Must be overwriten if needed
        ----------------------------------
        This method modifies the value of the VIEW_DIPAM_HANDLER to send to the view
        """
        return value

    def handle_data(self, data):
        """
        [NOT-OVERWRITABLE]
        """
        data["value"] = self.value2backend( data["value"] )
        return data

    def value2backend(self, value):
        """
        [REQ] Must be overwriten if needed
        ----------------------------------
        This method modifies the value of the VIEW_DIPAM_HANDLER that have been retrieved from the view
        """
        return value
