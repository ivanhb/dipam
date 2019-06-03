import re

class Filter(object):

    def __init__(self, tool_list):
        self.TOOL = tool_list

    def is_handled(self, t_value):
        return t_value in self.TOOL

    def filter_text(self, input_files, input_file_names, param):
        data_to_return = {"data":{}}

        # Check Restrictions
        ok_to_process = False
        if "d-gen-text" in input_files:
            if len(input_files["d-gen-text"]):
                ok_to_process = True

        if not ok_to_process:
            res_err = {"data":{}}
            res_err["data"]["error"] = {}
            res_err["data"]["error"]["ValueError"] = "Input data missing!"
            return res_err

        #Define the set of documents
        documents = []
        for a_file_value in input_files["d-gen-text"]:
            #iterate through the array of values given
            documents.append(a_file_value)
        documents_names = []
        for a_file_name in input_file_names["d-gen-text"]:
            #iterate through the array of values given
            documents_names.append(a_file_name)

        # Check the given param
        f_macro = []
        f_regex = ""
        if param != None:
            if "p-filteropt" in param:
                for f_opt in param["p-filteropt"]:
                    if f_opt == "names":
                        pass
                    elif f_opt == "dates":
                        documents = self._filter_dates(documents)
                    elif f_opt == "footnotes":
                        pass
            if "p-filterregex" in param:
                documents = self._filter_by_regex(documents, param["p-filterregex"])


        #numpy.savetxt("foo.csv", numpy.asarray(a_tab), delimiter=",")
        res_filtered = {}
        for i in range(0,len(documents)):
            res_filtered["filtered_"+documents_names[i]] = documents[i]

        data_to_return["data"]["d-gen-text"] = res_filtered
        return data_to_return

    def _filter_dates(self, documents):
        DATES_REGEX_list = [
            "([0-9]{4}/[0-9]{2}/[0-9]{2})",
            "([0-9]{2}/[0-9]{2}/[0-9]{4})",
            "([0-9]{4}-[0-9]{2}-[0-9]{2})",
            "([0-9]{2}-[0-9]{2}-[0-9]{4})"
        ]
        d_filtered = []
        for d in documents:
            for d_reg_i in DATES_REGEX_list:
                a_regex = re.compile(d_reg_i)
                d = re.sub(a_regex,"", d)
            d_filtered.append(d)
        return d_filtered

    def _filter_by_regex(self, documents, a_regex_str):
        d_filtered = []
        a_regex = re.compile(a_regex_str)
        for d in documents:
            d_filtered.append(re.sub(a_regex,"", d))
        return d_filtered
