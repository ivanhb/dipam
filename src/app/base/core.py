import yaml
import os
import re
import ast
import json
import zipfile
import io

import app.base.util as util
from app.base.messenger import DIPAM_MESSENGER
from app.base.__edge_dipam__ import EDGE_DIPAM_UNIT

class DIPAM_RUNTIME:

    def __init__(
        self,
        dipam_config
    ):

        # Dirs to use
        self.dir = {
            "app": dipam_config.get_config_value("dirs.dipam_app"),
            "runtime": os.path.join( dipam_config.get_config_value("dirs.dipam_app"), "runtime")
        }

        # Create an index to store conf of the units
        self.conf_units = {
            k_type: {
                "base": dipam_config.get_base_unit(k_type),
                "units": dipam_config.get_enabled_units(k_type)
            }
            for k_type in ["diagram","edge","data","tool"]
        }

        # The index of all running units (including the diagram and edges)
        self.runtime_units = dict()

        # init the runtime status
        self.init_runtime_status()


    def init_runtime_status(self):
        """
        Builds/creates the DIPAM runtime defaults data
        """
        # upload last runtime checkpoint
        util.copy_dir_to(
            os.path.join( self.dir["app"], "data" , "checkpoint" , "runtime" ),
            self.dir["app"]
        )

        # reload the diagram unit
        diagram_unit = util.create_instance(
            self.conf_units["diagram"]["base"]["model_fpath"],
            list(self.conf_units["diagram"]["units"].keys())[0], # DIAGRAM_DIPAM_UNIT
        )
        self.runtime_units[diagram_unit.id] = diagram_unit

        # reload all units
        workflow = json.load(open( os.path.join(self.dir["app"],"runtime","workflow.json") ))
        for _node in workflow["nodes"]:
            n_data = _node["data"]
            self.add_unit(
                n_data["type"],
                n_data["class"],
                n_data["id"],
                True
            )

        return True

    def save_runtime_status(self, storage_dir = None ):
        """
        Builds/creates the DIPAM runtime defaults data
        """
        source_dir = storage_dir
        dest_dir = os.path.join(self.dir["app"], "data", "checkpoint","runtime","unit")
        if not storage_dir:
            # take entire runtime directory
            source_dir = os.path.join( self.dir["app"],"runtime")
            dest_dir = os.path.join(self.dir["app"], "data", "checkpoint")

        util.copy_dir_to(
            source_dir,
            dest_dir
        )
        return True


    # UNIT HANDLER METHODS
    # ------
    def add_unit(self, unit_type, unit_class = None, unit_id = None, reload_value = False):
        """
        Add a new unit to the DIPAM runtime.
        """

        # in case a unit class is NOT specified, get first one in the list with a view tempalte
        unit_type_pool = self.conf_units[unit_type]["units"]
        if not unit_class:
            for _unit in unit_type_pool:
                if unit_type_pool[_unit]["view_fpath"]:
                    unit_class = _unit
                    break

        # create the new unit
        new_unit = util.create_instance(
            unit_type_pool[unit_class]["model_fpath"],
            unit_class )

        # set the new unit ID
        if unit_id == None:
            pref = "d-" if unit_type == "data" else "t-"
            new_unit.set_id( util.get_first_available_id(self.runtime_units, pref) )
            unit_id = new_unit.id
        else:
            new_unit.set_id(unit_id)

        # in case of data or tool units either:
        #   (1) reload and don't dump on file filesystem
        #   (2) or init the unit data in the filesystem
        if unit_type == "data" or unit_type == "tool":

            unit_runtime_dir = os.path.join(self.dir["runtime"], "unit")
            value_data = None
            if reload_value:
                value_data = new_unit.load_value( unit_runtime_dir )
            new_unit.write_value(
                data = value_data,
                source_is_view = False,
                unit_base_dir = unit_runtime_dir
            )

        # add the new unt to <runtime_units>
        self.runtime_units[unit_id] = new_unit
        return new_unit

    def delete_unit(self, unit_id):
        """
        Delete a Dipam unit from runtime;
        @param:
            <unit_id>: the id of the unit to delete
        """
        if unit_id in self.runtime_units:
            self.runtime_units[unit_id].rm_storage(
                os.path.join(self.dir["runtime"], "unit")
            )
            return self.runtime_units.pop(unit_id, None)
        return None

    def save_unit_data(self, data, unit_type, unit_class, unit_id, source_is_view = False):
        """
        Save the given <data> for a unit identified by <unit_id>
        @param:
            <unit_id>: the id of the unit to edit;
            <data>: the data to save
        """

        if unit_type == "data" or unit_type == "tool":
            res_write = self.runtime_units[unit_id].write_value(
                data,
                source_is_view,
                os.path.join(self.dir["runtime"], "unit")
            )

            res_app_msg = DIPAM_MESSENGER.build_app_msg(res_write)
            if not res_app_msg[1] == "error":
                return res_app_msg

            self.save_runtime_status()
            return res_app_msg

        return None, "error", "Not a data or tool unit"


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

            source_unit = self.runtime_units[source_id]
            target_unit = self.runtime_units[target_id]

            # reload the diagram unit
            edge_unit = util.create_instance(
                self.conf_units["edge"]["base"]["model_fpath"],
                list(self.conf_units["edge"]["units"].keys())[0] # DIAGRAM_DIPAM_UNIT
            )
            edge_unit.set_source(source_unit.id)
            edge_unit.set_target(target_unit.id)
            edge_unit.set_id()

            self.runtime_units[edge_unit.id] = edge_unit
            target_unit.value["input"][ source_unit.unit_class ] = source_id
            print("HERE:", self.runtime_units.keys() )
            return True, "info", "Link added"

        return False, "error", "Something worng happend"


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
            return self.runtime_units[target_id].remove_uinput(source_id)
        return False, "error", "source/target node of the edge has not been found"

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
        # if unit_id.startswith("e-"):
        #     return EDGE_DIPAM_UNIT.gen_view_template(
        #         self.conf_units["edge"]["base"]["view_fpath"],
        #         data = {"id":unit_id}
        #     )

        runtime_unit = self.runtime_units[unit_id]

        base_view = self.conf_units[runtime_unit.type]["base"]["view_fpath"]
        unit_view = None
        if runtime_unit.type == "data" or runtime_unit.type == "tool":
            unit_view = self.conf_units[runtime_unit.type]["units"][runtime_unit.unit_class]["view_fpath"]

        return self.runtime_units[unit_id].gen_view_template( base_view,unit_view )


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

        with open(yaml_config_file, 'r') as file:
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

        if unit_type == "diagram" or unit_type == "edge":
            return {unit_type.upper()+"_DIPAM_UNIT": self.get_base_unit(unit_type)}

        return self.get_classes_in_dir( os.path.join(dir,"unit",unit_type) )


    def get_base_unit(self, unit_type):
        """
        Return the model and view file path of a specific unit type
        """
        unit_type = unit_type.lower()
        dir_unit = os.path.join( self.get_config_value("dirs.src_app"),"base" )
        pref_fname = unit_type
        if unit_type == "tool" or unit_type == "data":
            pref_fname = unit_type[0]
            dir_unit = os.path.join( self.get_config_value("dirs.src_app"),"unit","base")

        return {
            "model_fpath": os.path.join(dir_unit,"__"+pref_fname+"_dipam__.py"),
            "view_fpath": os.path.join(dir_unit,"__"+pref_fname+"_dipam__.html")
        }
