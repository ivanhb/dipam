from collections import defaultdict

class D_DIPAM_UNIT:
    """
    Defines a DIPAM data unit;
    New data units to integrate should extend this Class.

    @param:
        + <label>: name/title of the dipam data
        + <description>: a description of the dipam data,
        + <family>: the macro family of the data,
        + <handler>: a list of entities representing the values to be stored in this data unit;
            each entity is represented by: its io handler, value handler (if any), and file handler (if any)
    """
    def __init__(
            self,
            label = "Dipam data title",
            description = "A description of the Dipam data",
            family = "The macro family of the Dipam data",
            value_index = [
                (
                    None, # 0: IO_DIPAM_HANDLER
                    None, # 1: VIEW_DIPAM_HANDLER (for VALUE)
                    None # 2: VIEW_DIPAM_HANDLER (for FILE)
                )
            ]

        ):
        self.type = "data"
        self.id = "d-NN"
        self.label = label
        self.description = description
        self.family = family

        self.value_index = value_index
        _index = defaultdict(int)
        for _v in self.value_index:
            c_name = _v[0].__class__.__name__
            _index[c_name] += 1
            _v[0].set_id( _index[c_name] )


    def set_id(self, id):
        """
        [NOT-OVERWRITABLE]
        Defines the id of the data unit.
        @param:
            + idx: a number to concat with the rest of the identifier
        @return: the id of the data unit
        """
        self.id = str(id)
        return self.id

    def get_metadata(self):
        """
        [NOT-OVERWRITABLE]
        Returns the data to be used when storing the index data describing this unit
        """
        data = {
            "type": self.type,
            "id": self.id,
            "class": self.__class__.__name__,
            "label": self.label,
            "description": self.description,
            "family": self.family
        }
        return data

    def set_metadata(self,data):
        """
        [NOT-OVERWRITABLE]
        Returns the data to be used when storing the index data describing this unit
        """
        updated_keys = set()
        for k in data:
            if hasattr(self, k):
                setattr(self, k, data[k])
                updated_keys.add(k)
        return updated_keys

    def backend2view(self):
        """
        [NOT-OVERWRITABLE]
        Generates the data (as dict) to send to the view;
        value are edited following "value_view" (DIPAM_VIEW), if defined.
        @param:
        @return: a directory representing the data to send to the view
        """

        data = {
            "type": self.type,
            "id": self.id,
            "label": self.label,
            "description": self.description,
            "family": self.family,
            "value_index": dict()
        }

        for _v_part in self.value_index:
            _v_part_io_handler = _v_part[0]
            _v_part_value = _v_part_io_handler.read()
            _v_part_id = _v_part_io_handler.id

            data["value_index"][ _v_part_id ] = {
                    "value": _v_part_value,
                    "v-view": None,
                    "f-view": None
            }

            # Build view if specified
            _v_part_data = data["value_index"][ _v_part_id ]
            if _v_part[1]:
                _v_part_data["v-view"] = _v_part[1].gen_data(_v_part_value)
            if _v_part[2]:
                _v_part_data["f-view"] = _v_part[2].gen_data(_v_part_value)

        return data


    def view2backend(self, type, *args):
        """
        Defines the id of the data unit.
        @param:
            + <type>: is either "VALUE" or "FILE", to specify the corresponding view trigger
        @return:
        """

        if type == "VALUE":
            self.value_view_handler(args)
        elif type == "FILE":
            self.file_view_handler(args)

        if self.io_handler.check(type, args):
            # read it and save it as the current value of this data unit
            self.value = self.io_handler.read(type, args)
            # store the new value on the target dir of this dipam data unit
            self.io_handler.store(self.value)
            return True

        return False
