
class Data(object):

    def __init__(self):
        # All the type of data in their corresponding data-class
        self.data_index = {}
        #self.data_index["d-gen-text"] = "text"
        #self.data_index["d-gen-table"] = "table"

    def set_data_index(self, data_config):
        for k_data in data_config:
            self.data_index[k_data] = data_config[k_data]["data_class"]

    def handle(self, files_list, data_value, file_path = False):
        document = []
        data_class = None
        if data_value in self.data_index:
            data_class = self.data_index[data_value]
            if files_list:
                for a_file in files_list:

                    #open the file to read
                    if file_path:
                        a_file = open(a_file,"r", encoding='utf-8', errors='ignore')

                    if data_class == 'text':
                        document.append(self.process_text(a_file))
                    elif data_class == 'table':
                        document.append(self.process_table(a_file))

                    #close the file
                    if file_path:
                        a_file.close()

        return document

    def process_text(self,a_file):
        return a_file.read()

    def process_table(self,a_file):
        return a_file.read()
