from app.base.messenger import DIPAM_MESSENGER
from app.base.__unit_dipam__ import DIPAM_UNIT
import app.base.util as util
from collections import defaultdict
from pathlib import Path
import re
import os

class D_DIPAM_UNIT(DIPAM_UNIT):
    """
    Defines a DIPAM data unit;
    New data units to integrate should extend this Class, and define the following @param(s) and @method(s)

    @param:
        + <family>: the macro family of the data,
        + <value>: the initial value to assign for this data unit

    @method:
        + check_value()
        + [*] store_value()
        + [*] load_value()
        + is_value_match()
        + finput_manager()
        + vinput_manager()

    [*]: Mandatory
    """
    def __init__(
            self,
            label = "Dipam data title",
            description = "A description of the Dipam data",
            family = "The macro family of this Dipam data",
            value = None
        ):

        super().__init__(
            type = "data",
            label = label,
            description = description
        )

        self.family = family
        self.value = value


    #   -----
    #   Methods to manage writing/updating self.value
    #   -----

    def write_value(self, data = None, source_is_view = False, unit_base_dir = None):
        """
        [NOT-OVERWRITABLE]
        This method writes a given value into a "FILE" or "VALUE" (<type>);
        <args> are different depending on the <type> value
        @param:
        @return:
            self.value
        """

        # in case <data> is not provided then take the current self.value
        new_value = self.value
        if data:
            new_value = data

        # if source_is_view, then a convertion of the data into self.value is needed first;
        if source_is_view:

            try:
                if "finput" in data:
                    l_files = [ data["finput"] ] if isinstance(data["finput"], list) else data["finput"]
                    new_value = self.finput_manager(l_files)

                if "vinput" in data:
                    new_value = self.vinput_manager(data["vinput"])
            except:
                return None,"error","Something wrong in the input(s) management"

        if new_value == None or new_value == False:
            return DIPAM_MESSENGER.build_app_msg(None,400)

        # control if the new value passes the check
        _check = self.check_value(new_value)
        if not _check:
            return _check

        # all went fine: assign view values to to self attributes
        if source_is_view:
            self.assign_view_values(data)

        # control if the new value is different from the current one
        # stop here in case this was not the init of the unit
        _check = self.is_value_match(new_value)
        if _check:
            if data:
                return None,"warning","Nothing to write: value is the same"

        # Assign the new value
        self.value = new_value

        # Dump it in case <unit_dir_path> is given
        if unit_base_dir:
            self.mk_storage(unit_base_dir)
            if self.value:
                self.store_value(unit_dir)

        return self.value

    def check_value(self, a_value):
        return True

    def store_value(self, unit_dir_path):
        """
        [OVERWRITABLE]
        This methods defines how to write a file contating the data of this unit;
        its based on the values contained in <self.value>;
        @param:
            <unit_dir_path>: to define where to store the file to write
        @return:
            True/False, If False, an explaination is given (tuple)
        @NOTE: Subclasses must override this method and use <self.value>;
            also it must always contain <unit_dir_path> as param
        """
        return True

    def load_value(self, unit_dir_path):
        """
        [OVERWRITABLE]
        Reads the value of the unit; <unit_dir_path> is the dir on file system to read data from;
        """
        return None

    def rm_storage(self, unit_dir_path):
        """
        [NOT-OVERWRITABLE]
        Remove the File system storage
        """
        unit_dir = os.path.join(unit_dir_path, self.id)
        return util.delete_path( unit_dir )

    def mk_storage(self, unit_dir_path):
        """
        [NOT-OVERWRITABLE]
        Remove the File system storage
        """
        unit_dir = os.path.join(unit_dir_path, self.id)
        if not os.path.exists(unit_dir):
            os.mkdir(unit_dir)
            return True
        return None



    def is_value_match(self, a_value):
        """
        [OVERWRITABLE]
        Checks if a given value <a_value> is "equal" to <self.value>
        @return:
            True/False
        """
        return True


    # ---
    # Methods to manage the view:
    # (1) gen_view_template(): to generate the view template of this data unit
    # (2) [OVERWRITABLE] finput_manager(): to manage the uploaded files
    # (3) [OVERWRITABLE] vinput_manager(): to manage the <data-dipam-value>(s) defined in the HTML template;
    # ---

    def finput_manager(self, l_files):
        """
        [OVERWRITABLE]
        This method is responsible for processing uploaded files;
        It reads the file data, applies relevant transformations, and returns a new value (with the format of <self.value>) as a result;
        The content validation of the new value produced is out of scope for this method.
        @param:
            <data> is a list of files (use read() to read the content of each item in the list)
        @return:
            a new value to assign to <self.value>
        """
        return None

    def vinput_manager(self, data):
        """
        [OVERWRITABLE]
        This method is responsible for processing/normalizing an uploaded direct input from the view;
        The content validation of the new value produced is out of scope for this method.
        DIRECT_INPUT_NAME must be set as the name of the direct input that this method manages
        @param:
            <data> the values given by the view
        @return:
            a new value to assign to <self.value>
        """
        return True
