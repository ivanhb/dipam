
class DIPAM_MESSENGER:

    type = {
        200: ("error","DIPAM operated correctly"),
        304: ("warning","No operation done by DIPAM"),
        400: ("error","Bad Request"),
        401: ("error","Not authorized operation"),
        404: ("error","Resource not found")
    }

    @classmethod
    def build_app_msg(cls, data = None, code =None):
        """
        @param:
            <data>: a single value or a tuple of 3 items storing: (data, log_type, log_msg)
                e.g. "Hi my name is Ivan" or (None, 'error', 'Some mandatory parameters are not set')
            <code>: a code for the log_type (e.g. 200, 400, etc)
        @return:
            a Tuple storing the data, log_type, and log_msg
        """
        # if data is already a tuple
        if data:
            if isinstance(data, tuple):
                return data
            else:
                return (data, None, None)
        if code:
            return (None, cls.type[code][0], cls.type[code][1])
        return (None,None,None)

    @classmethod
    def build_view_msg(cls, data=None, code=None):
        """
        @param:
            <data>: a tuple of 3 items storing: (data, log_type, log_msg)
                e.g. (None, 'error', 'Some mandatory parameters are not set')
            <code>: a code for the log_type (e.g. 200, 400, etc)
        @return:
            a JSON storing the data, log_type, and log_msg
        """
        res = {
            "data": None,
            "log_type": None,
            "log_msg": None
        }

        if isinstance(data,tuple) and len(data) == 3:
            res["data"], res["log_type"], res["log_msg"] = data[:3]
        elif data:
            res["data"], res["log_type"], res["log_msg"] = data, "success", None

        if code:
            res["data"], res["log_type"], res["log_msg"] = None, cls.type[code][0], cls.type[code][1]

        return res
