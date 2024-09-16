
class D_DIPAM_UNIT:
    def __init__(
            self,
            num_id = 1,
            id = "d_dipam",
            label = "Dipam data title",
            description = "A description of the Dipam data",
            family = "The macro family of the Dipam data",
            file = [],
            file_extension = [],
            value_type = None,
            value = None
        ):
        """
        label: name/title of the dipam data
        description: a description of the dipam data,
        family: the macro family of the data,
        file: the path to the file(s) of this data type,
        file_extension: the file_extension(s) handled for this data
        value_type: the type of the value (e.g., int, list, <CLASS>)
        value: the corresponding value
        """

        self.id = id + "_"+str(num_id)
        self.label = label
        self.description = description
        self.family = family
        self.file = file
        self.file_extension = file_extension
        self.value_type = value_type
        self.value = value
        self.error = D_DIPAM_ERROR()

    def backend2view(arg):
        data = {
            "id": self.id,
            "label": self.label,
            "description": self.description,
            "family": self.family,
            "error": self.error,
            "value": self.value
        }
        json_data = json.dumps(data)
        return json_data

    def view2backend(arg):
        pass

    def read(self):
        """
        Read the contents of Data and return the values
        :return: contents of the data
        """

        if self.value:
            self.value_check()
            self.value_read()

        elif file:
            self.file_check()
            self.file_read()

        else:
            self.error.set("No corresponding value!")

        return self.value, self.error


    def value_check(self):
        """
        This method updates self.error if a corresponding value self.value is not suitable for this data unit
        In case of no errors then self.error is not updated
        """
        if not isinstance(self.value, eval(self.value_type)):
            self.error.set("Value type not supported!")
            return False
        return True


    def value_read(self):
        """
        This method must define a way to read self.value
        [OPT] overwrite self.value if needed
        [OPT] overwrite self.error in case of error
        """

    def file_check(self):
        """
        This method updates self.error if a self.file is not suitable for this data unit
        In case of no errors then self.error is not updated
        """
        if not self.file.endswith(self.file_extension):
            self.error.set("File type not supported!")

    def file_read(self):
        """
        >> [REQ] to be overwriten
        ----------------------------------
        This method must define a way to read self.file
        [REQ] overwrite self.value
        [OPT] overwrite self.error in case of error
        """

    def write(self, s, store_type, dipam_io):
        """
        Write the contents of <s> into a file(s) or value
        :params:
            <s>: the content a list of values
            <store_type>: "FILE" or "VALUE"
        :return:
            file(s) name or value
        """
        self.value_write(s)
        if self.value_check():
            if store_type.startswith("FILE"):
                self.file_write(s)
                f_storage = []
                if store_type.endswith("MULTI"):
                    for _v in self.value:
                        f_storage.append( dipam_io.save_d_tmp(self.id, _v, self.file_extension) )
                elif store_type.startswith("ONE"):
                    f_storage.append( dipam_io.save_d_tmp(self.id, self.value, self.file_extension) )

                return f_storage, self.error

        return self.value, self.error

    def value_write(self, s):
        self.value = s

    def file_write(self, s):
        self.value = s



class D_DIPAM_ERROR:
    def __init__(
            self,
            value = None
        ):
        """
        value: a string that describes the error in the dipam data
        """
        self.value = value

    def set(self, s):
        self.value = s

    def get(self):
        return self.value
