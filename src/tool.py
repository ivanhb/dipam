class tool(object):


    def __init__(self):
        pass

    #run a func
    def run(self, id_name, input_data, param = []):
        res = -1
        try:
            res = getattr(self, id_name)(input_data, param)
            return res
        except AttributeError:
            return res


    #tools
    def lda(self, input_data, param = []):
        return input_data
