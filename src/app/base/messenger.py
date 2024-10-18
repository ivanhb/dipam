
class DIPAM_MESSENGER:

    def __init__(
        self,
        msg = {}
    ):
        self.type = {
            200: "DIPAM operated correctly",
            304: "No operation done by DIPAM",
            400: "Bad Request",
            401: "Not authorized operation",
            404: "Resource not found"
        }


    def build_app_msg(self, data, msg, type = "error"):
        if type == "error":
            return data,"[ERROR] "+msg
        if type == "warning":
            return data,"[WARNING] "+msg
        return data,"[INFO] "+msg


    def build_view_msg(self, data= None, code = None, integrate_data = False):
        """
        """
        if code:
            return self.type[code], code
        elif isinstance(data,tuple):
            if data[1].startswith("[ERROR]"):
                return self.type[400] +" – "+ data[1], 400

            elif data[1].startswith("[WARNING]"):
                return self.type[304] +" – "+ data[1], 304
        else:
            if data == None:
                return self.type[304], 304

        if integrate_data:
            return data, 200

        return self.type[200], 200
