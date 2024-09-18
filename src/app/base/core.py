import yaml
import os
import re
import ast
import json
import app.base.util as util
import zipfile
import io

class DIPAM_RUNTIME:

    def __init__(
        self,
        dipam_config,
        dipam_units
    ):
        self.config = dipam_config
        self.runtime_dir = os.path.join(
            self.config.get_config_value("dirs.dipam_app"),
            "runtime"
        )

        self.units = dipam_units
        self.data = []
        self.tool = []
        self.param = []

    def init_runtime_defaults(self):
        """
        Builds/creates the DIPAM runtime defaults data
        + Args: __
        + Returns: __
        """
        # upload last runtime checkpoint
        dir_dipam_app = self.config.get_config_value("dirs.dipam_app")
        util.copy_dir_to(
            os.path.join( dir_dipam_app,"data","checkpoint","runtime"),
            dir_dipam_app
        )

    def _build_index(self):
        """
        [LOCAL-METHOD]
        Builds the runtime index of DIPAM
        + Args: __
        + Returns: __
        """

        with open(os.path.join(self.runtime_dir, "workflow.json"), 'r') as file:
            workflow_data = json.load(file)

        index_data = {
            "data":{},
            "tool":{}
        }

        if "nodes" in workflow_data:
            for _n in workflow_data["nodes"]:
                if "data" in _n:
                    _n_id = _n["data"]["id"]
                    if _n_id.startswith("d-"):
                         index_data["data"][_n_id] = {}
                    elif _n_id.startswith("t-"):
                         index_data["tool"][_n_id] = {}

        self.set_runtime_index( index_data  )


    def create_new_unit(self, unit_type, unit_class):
        unit_type = unit_type.lower()

        # in case a unit class is not specified, get first one in the list
        if not unit_class:
            unit_class = next(iter(self.units[unit_type]))

        unit_class = unit_class.upper()
        runtime_index_data = self.get_runtime_index()
        new_unit = util.create_instance(
            self.units[unit_type][unit_class],
            unit_class
        )
        unit_id = new_unit.set_id( len(runtime_index_data[unit_type].keys()) + 1 )
        runtime_index_data[unit_type][unit_id] = {}
        util.mkdir_at(
            os.path.join(self.runtime_dir, "unit"),
            unit_id)
        self.set_runtime_index(runtime_index_data)
        return new_unit

    def get_runtime_index(self):
        with open(os.path.join(self.runtime_dir, "index.json"), 'r') as file:
            data = json.load(file)
        return data

    def set_runtime_index(self, data):
        with open(os.path.join(self.runtime_dir, "index.json"), 'w') as json_file:
            json.dump(data, json_file, indent=4)

    def reset_runtime_index(self):
        data = {"data":{},"tool":{}}
        with open(os.path.join(self.runtime_dir, "index.json"), 'w') as json_file:
            json.dump({}, json_file, indent=4)

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


    """
    Given a key <s> the method returns the corresponding value in self.yaml_config_value
    Inner keys are specified with a "."
    :return: value of the key in the self.yaml_config_value
    """
    def get_config_value(self, s):
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


    """
    Go through all .py files in <directory> and extract the names of all the defined classes
    """
    def get_classes_in_dir(self, directory):
        all_classes = dict()

        for filename in os.listdir(directory):
            if filename.endswith(".py"):
                file_path = os.path.join(directory, filename)
                with open(file_path, 'r') as file:
                    file_content = file.read()
                tree = ast.parse(file_content)
                class_names = [node.name for node in ast.walk(tree) if isinstance(node, ast.ClassDef)]
                for _c in class_names:
                    all_classes[_c] = directory + "/" +filename
        return all_classes


    """
    Return a list of all the DIPAM data units classes enabled (ready to be used)
    """
    def get_enabled_units(self, unit_type):
        unit_type = unit_type.lower()
        dir = self.get_config_value("dirs.src_app")
        enabled_path = dir+"/unit/"+unit_type+"/enabled"
        return self.get_classes_in_dir(enabled_path)


class DIPAM_IO:

    def __init__(
            self
        ):
        """
        """
        self.config = DIPAM_CONFIG()

    def save_d_tmp(self, d_id, f_content, f_extension):

        path_tmp_d_write = self.config.get_config_value("dirs.tmp_d_write")
        last_f_num = __get_largest_numbered_file( path_tmp_d_write, d_id )

        f_name = d_id+"_"+str(last_f_num+1)+"."+f_extension
        f_path = self.config.get_config_value("dirs.tmp_d_write") + "/" + f_name

        with open(f_path, 'w') as file:
            file.write(f_content)

        return f_path


    def __get_largest_numbered_file(dir,f_name):
        """
        [LOCAL-METHOD] Gets the file that starts with <f_name> contained in <dir> with the bigger number
        """

        pattern = re.compile(r'^'+f_name+'_(\d+)$')
        max_num = -1
        largest_file = None

        # Loop through all files in the directory
        for filename in os.listdir(dir):
            match = pattern.match(filename)
            if match:
                number = int(match.group(1))
                if number > max_num:
                    max_num = number
                    largest_file = filename

        return max_num
