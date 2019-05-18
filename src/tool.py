from src.textAnalysis import TextAnalysis

class Tool(object):


    def __init__(self):
        text_handler = TextAnalysis()
        pass

    #run a func
    def run(self, id_name, method, input_data, param = None):
        res = -1
        try:
            res = getattr(self, method)(input_data, param)
            print("The node:"+id_name+" . Return result: "+res)
            return res
        except AttributeError:
            return res


    #tools
    def lda(self, input_data, param):

        files = []
        text_handler.lda(files, param)
        return input_data
