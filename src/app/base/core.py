import yaml
import os
import re
import ast
import json
import zipfile
import io

import app.base.util as util
from app.base.messenger import DIPAM_MESSENGER

class DIPAM_RUNTIME:

    def __init__(
        self,
        dipam_config
    ):

        self.unit_base = {
            "diagram": dipam_config.get_base_unit("diagram"),
            "data": dipam_config.get_base_unit("data"),
            "tool": dipam_config.get_base_unit("tool")
        }
        self.unit_index = {
            "data": dipam_config.get_enabled_units("data"),
            "tool": dipam_config.get_enabled_units("tool")
        }
        self.diagram_unit = util.create_instance(
            self.unit_base["diagram"]["model_fpath"],
            "DIAGRAM_DIPAM_UNIT")


        self.runtime_dir = os.path.join(
            dipam_config.get_config_value("dirs.dipam_app"),
            "runtime"
        )
        self.runtime_units = dict()

        self.config = dipam_config

        self.init_runtime_status()


    def init_runtime_status(self):
        """
        Builds/creates the DIPAM runtime defaults data
        """
        # upload last runtime checkpoint
        dir_dipam_app = self.config.get_config_value("dirs.dipam_app")
        #if not os.path.exists( os.path.join(dir_dipam_app,"runtime") ):
        util.copy_dir_to(
            os.path.join( dir_dipam_app,"data","checkpoint","runtime"),
            dir_dipam_app
        )

        # reload all units
        workflow = json.load(open( os.path.join(dir_dipam_app,"runtime","workflow.json") ))
        for _node in workflow["nodes"]:
            _node_data = _node["data"]
            self.add_unit(
                _node_data["type"],
                _node_data["class"],
                _node_data["id"],
                _node_data["value"],
                False
            )

        return True

    def save_runtime_status(self, storage_dir = None ):
        """
        Builds/creates the DIPAM runtime defaults data
        """
        dir_dipam_app = self.config.get_config_value("dirs.dipam_app")

        dir_to_copy = storage_dir
        dest_dir = os.path.join(dir_dipam_app, "data", "checkpoint","runtime","unit")
        if not storage_dir:
            # take entire runtime directory
            dir_to_copy = os.path.join( dir_dipam_app,"runtime")
            dest_dir = os.path.join(dir_dipam_app, "data", "checkpoint")

        util.copy_dir_to(
            dir_to_copy,
            dest_dir
        )
        return True


    # UNIT HANDLER METHODS
    # ------
    def add_unit(self, unit_type, unit_class = None, unit_id = None, unit_metadata = None, dump_values = True):
        """
        """
        unit_type = unit_type.lower()

        # in case a unit class is not specified, get first one in the list with a view tempalte
        unit_type_pool = self.unit_index[unit_type]
        if not unit_class:
            for _unit in unit_type_pool:
                # check if has a view template
                if unit_type_pool[_unit]["view_fpath"]:
                    unit_class = _unit
                    break

        # unit_class = unit_class.upper()
        unit_class_file = unit_type_pool[unit_class]["model_fpath"]
        new_unit = util.create_instance(
            unit_class_file,
            unit_class
        )

        if not unit_id:
            pref = "d-" if unit_type == "data" else "t-"
            unit_id = new_unit.set_id( util.get_first_available_id(self.runtime_units, pref) )
        else:
            # use the given one
            new_unit.set_id(unit_id)

        if unit_metadata:
            new_unit.set_meta_attributes(unit_metadata)

        self.runtime_units[unit_id] = new_unit

        # dump values on filesystem
        unit_runtime_dir = os.path.join(self.runtime_dir, "unit", unit_id)
        if unit_type == "tool":
            unit_runtime_dir = os.path.join(self.runtime_dir, "unit")

        if dump_values:
            self.runtime_units[unit_id].write(None, False, unit_runtime_dir);
            
        return new_unit

    def delete_unit(self, unit_id):
        """
        Delete a Dipam unit from runtime;
        @param:
            <unit_id>: the id of the unit to delete
        """
        # remove it from the index.json;
        unit_type = "data" if unit_id.startswith("d-") else "tool"

        # remove its corresponding data
        if unit_type == "data":
            util.delete_path( os.path.join(self.runtime_dir, "unit",unit_id) )
        elif unit_type == "tool":
            util.delete_file( os.path.join(self.runtime_dir, "unit",unit_id+".json") )
        return unit_id

    def save_unit_data(self, data, unit_id, source_is_view = False):
        """
        Save the given <data> for a unit identified by <unit_id>
        @param:
            <unit_id>: the id of the unit to edit;
            <data>: the data to save
        """
        unit_type = "data" if unit_id.startswith("d-") else "tool"

        # set the base runtime directory
        unit_runtime_dir = os.path.join(self.runtime_dir, "unit", unit_id)
        if unit_type == "tool":
            unit_runtime_dir = os.path.join(self.runtime_dir, "unit")

        res_write = self.runtime_units[unit_id].write(data, source_is_view, unit_runtime_dir)

        res_app_msg = DIPAM_MESSENGER.build_app_msg(res_write)
        if not res_app_msg[1] == "error":
            return res_app_msg

        self.save_runtime_status(unit_runtime_dir)
        return res_app_msg


    # LINK HANDLER METHODS
    # ------

    def add_link(self, source_id, target_id):
        """
        Adds a link between 2 Dipam units <source_id> and <target_id>;
        Not compatible units are not linked;
        @param:
            <source_id>: the id of the source unit
            <target_id>: the id of the target unit
        @return:
            True if the link is creted, False otherwise;
        """
        # check if both source and target are part of runtime units;
        if source_id in self.runtime_units and target_id in self.runtime_units:
            # check if source is compatible with target;
            # i.e., source output might be connected to tool input
            if self.check_unit_compatibility(source_id, target_id):

                s_obj = self.runtime_units[source_id]
                t_obj = self.runtime_units[target_id]

                input_data = [s_obj]
                if s_obj.type == "tool":
                    input_data = s_obj.output

                t_obj.set_data_input( input_data )
                return True

        # for all other cases
        return False

    def delete_link(self, source_id, target_id):
        """
        Delete a link between 2 Dipam units <source_id> and <target_id>;
        @param:
            <source_id>: the id of the source unit
            <target_id>: the id of the target unit
        @return:
            True if the link was deleted
        """
        # check if both source and target are part of runtime units;
        if source_id in self.runtime_units and target_id in self.runtime_units:
            # delete it from the inputs of target
            t_obj = self.runtime_units[target_id]
            t_obj.delete_data_input(source_id)
            return True
        return False

    def check_unit_compatibility(self, unit_id, unit_b_id = None):
        """
        Check the compatible Dipam units of <unit_id>;
        Compatible units are these that <unit_id> can link to;
        if <unit_b_id> is specified thene the check is done only with that unit.
        @param:
            <unit_id>: the id of the unit to delete
            [<unit_b_id>]: in case the check must be done only with a specific unit
        @return:
            a dict of all units (data and tool), with a corresponding True/False value;
            if <unit_b_id> is specified only a True/False value is returned
        """
        res = {u_id: False for u_id in self.runtime_units}

        # (1) Build the set of compatible data units
        seed_unit = self.runtime_units[unit_id]
        compatible_class = None
        if unit_id.startswith("t-"):
            compatible_class = set( seed_unit.output )
        elif unit_id.startswith("d-"):
            compatible_class = { seed_unit.unit_class }

        # (2) Check compatibility with all "tool" units in the system
        # (whether i am checking a "tool" or "data" unti, none of them can be connected to a data)
        # we need to check if the intersection with (1) gives more than 1 (so its compatible)
        units_to_check = self.runtime_units.keys()

        for k in units_to_check:
            if k == unit_id:
                res[k] = True
            elif k.startswith("t-"):
                _obj = self.runtime_units[k]
                class_to_check = set( [_in[0] for _in in _obj.input] )
                res[_obj.id] = len(compatible_class.intersection( class_to_check )) > 0

        if unit_b_id != None:
            return {unit_b_id: res[unit_b_id]}

        return res

    def build_view_template(self, unit_id):
        """
        Build the base and specific unit template
        @param:
            <unit_id>: the unit id
        @return:
            HTML content ready to be inserted in the interface
        """
        base_view_fpath = None
        unit_type = None
        if unit_id.startswith("diagram"):
            base_view_fpath = self.unit_base["diagram"]["view_fpath"]
            return self.diagram_unit.gen_view_template(base_view_fpath)
        elif unit_id.startswith("d-"):
            unit_type = "data"
            base_view_fpath = self.unit_base["data"]["view_fpath"]
        elif unit_id.startswith("t-"):
            unit_type = "tool"
            base_view_fpath = self.unit_base["tool"]["view_fpath"]

        class_name = self.runtime_units[unit_id].__class__.__name__
        unit_view_fpath = self.unit_index[unit_type][class_name]["view_fpath"]

        return self.runtime_units[unit_id].gen_view_template(
            base_view_fpath,
            unit_view_fpath
        )


    # RUNTIME INDEX METHODS
    # ------

    def is_runtime_zip_data(self, zip_stream):
        try:
            with zipfile.ZipFile(zip_stream, 'r') as zip_ref:
                file_list = zip_ref.namelist()
            return "workflow.json" in file_list and "index.json" in file_list, ""
        except Exception as e:
            return False, "[ERROR]: The file is not a valid runtime ZIP file! – "+str(e)



class DIPAM_CONFIG:

    def __init__(
            self,
            yaml_config_file
        ):
        """
        yaml_config_file: the path to the configuration file in yaml
        """

        self.yaml_config_file = yaml_config_file
        self.yaml_config_value = None

        with open(self.yaml_config_file, 'r') as file:
            self.yaml_config_value = yaml.safe_load(file)

    def get_config_value(self, s):
        """
        Given a key <s> the method returns the corresponding value in self.yaml_config_value
        Inner keys are specified with a "."
        :return: value of the key in the self.yaml_config_value
        """
        data = self.yaml_config_value
        keys = s.split('.')

        for key in keys:
            if isinstance(data, dict):
                data = data.get(key, None)
            elif isinstance(data, list):
                try:
                    for _elem in data:
                        if key in _elem:
                            data = _elem[key]
                except (ValueError, IndexError):
                    return None
            else:
                return None

        return data

    def get_classes_in_dir(self, directory):
        """
        Go through all .py files in <directory> and extract the names of all the defined classes
        """
        all_classes = dict()

        all_files = os.listdir(directory)
        for filename in all_files:
            if filename.endswith(".py"):
                # in case is dipam base file skip it
                if filename.startswith("__d_dipam__") or filename.startswith("__t_dipam__"):
                    continue
                file_path = os.path.join(directory, filename)
                with open(file_path, 'r') as file:
                    file_content = file.read()
                tree = ast.parse(file_content)
                class_names = [node.name for node in ast.walk(tree) if isinstance(node, ast.ClassDef)]
                view_template = None
                if filename.replace(".py",".html") in all_files:
                    view_template = file_path.replace(".py",".html")
                for _c in class_names:
                    # for each class set its file path and whether it has/has not a template view
                    all_classes[_c] = {
                        "model_fpath": file_path,
                        "view_fpath": view_template
                    }
        return all_classes


    def get_enabled_units(self, unit_type):
        """
        Return a list of all the DIPAM data units classes enabled (ready to be used)
        """
        unit_type = unit_type.lower()
        dir = self.get_config_value("dirs.src_app")
        _path = os.path.join(dir,"unit",unit_type)
        return self.get_classes_in_dir(_path)

    def get_base_unit(self, unit_type):
        """
        Return the model and view file path of a specific unit type
        """
        unit_type = unit_type.lower()
        dir = self.get_config_value("dirs.src_app")

        if unit_type == "tool" or unit_type == "data":
            fname = "d_dipam"
            if unit_type == "tool":
                fname = "t_dipam"

            return {
                "model_fpath": os.path.join(dir,"unit",unit_type,"__"+fname+"__.py"),
                "view_fpath": os.path.join(dir,"unit",unit_type,"__"+fname+"__.html")
            }
        elif unit_type=="diagram":
            fname = "diagram_dipam"
            return {
                "model_fpath": os.path.join(dir,"base","__"+fname+"__.py"),
                "view_fpath": os.path.join(dir,"base","__"+fname+"__.html")
            }
