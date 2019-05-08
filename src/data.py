class Data(object):


    def __init__(self, id, data_class):
        res = ""
        if data_class == 'table':
            res = "<Table>"
        elif data_class == 'text':
            res = "<Text>"

        print("The node:"+id+" . Return result: "+res)
