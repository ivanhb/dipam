
class IO_DIPAM_HANDLER:
    """
    A DIPAM IO read/write handler for a data type;
    The class must handle direct values and files storing the data
    @param:
        + <id>:
        + <f_att>:
    """
    def __init__(self,
        id = "io_dipam_handler",
        v_att = {
            # ... To be extended by the extending classes
        },
        f_att = {
            "extension": []
            # ... To be extended by the extending classes
        }
    ):
        # this variable stores the current value
        self.value = None
        self.type = "io_dipam_handler"
        self.id = id
        self.v_att = f_att
        self.f_att = f_att

    def set_id(self, idx):
        """
        Add a number to the end of the id.
        @param:
            + idx: a number to concat with the rest of the identifier
        @return: the id of the data unit
        """
        self.id = self.id + "-"+ str(idx)
        return self.id

    def set_f_att(self, f_att):
        """
        [NOT-OVERWRITABLE]
        This method sets the attributes of the file to handle (<f_att>)
        """
        for k,v in f_att:
            if k in self.f_att:
                self.f_att[k] = f_att[k]
        return self.f_att

    def set_v_att(self, v_att):
        """
        [NOT-OVERWRITABLE]
        This method sets the attributes of the value to handle (<v_att>)
        """
        for k,v in v_att:
            if k in self.v_att:
                self.v_att[k] = v_att[k]
        return self.v_att

    def check(self, type, *args):
        """
        [NOT-OVERWRITABLE]
        This method checks if a given data ("FILE" or "VALUE") respects this io_dipam_handler
        @param:
            + <type>: "FILE" or "VALUE"
            + <args>: additional arguments;
                a value(s) in case <type> == "VALUE";
                a file path(s) in case <type> == "FILE"
        """
        check = True
        if type == "FILE":
            check = self.f_check(args)
        check = check and self.v_check(args)
        return check

    def f_check(self, f_path = []):
        """
        [OPT-OVERWRITABLE]
        This method checks if a file in <f_path> is suitable for this file_dipam_handler
        @param:
            + <f_path>: a list of file path(s)
        """
        check = True
        for _fp in f_path:
          check &= any([_fp.endswith(f_ext) for f_ext in self.f_att.extension])
        return check

    def v_check(self):
        """
        [OPT-OVERWRITABLE]
        This method checks if a value in <value> is suitable for this file_dipam_handler
        """
        check = True
        if not self.value:
            check = False
        return check

    def read(self, *args):
        """
        [NOT-OVERWRITABLE]
        This method reads a given data, "FILE" or "VALUE" (<type>)
        @param:
            + <type>: "FILE" or "VALUE"
            + <args>: additional arguments;
        """
        if args:
            self.f_read(args)
        return self.v_read()

    def f_read(self, f_path = []):
        """
        [OPT-OVERWRITABLE]
        This method reads a value(s) in <value> and returns its value
        @param:
            + <value>: a corresponding value
        """
        return None

    def v_read(self):
        """
        [OPT-OVERWRITABLE]
        This method returns the value
        """
        return self.value


    def write(self, type, *args):
        """
        [NOT-OVERWRITABLE]
        This method writes a given value into a "FILE" or "VALUE" (<type>);
        <args> are different depending on the <type> value
        @param:
            + <type>: "FILE" or "VALUE"
            + <args>: additional arguments
        """
        self.v_write(args)
        if type == "FILE":
            self.f_write(args)
        return res


    def f_write(self, *args):
        """
        [REQ-OVERWRITABLE]
        """
        _dest = args[0]
        with open(_dest, 'w') as file:
            file.write( self.value )
        return self.value

    def v_write(self, *args):
        """
        [REQ-OVERWRITABLE]
        """
        _val = args[0]
        self.value = _val
        return _val
