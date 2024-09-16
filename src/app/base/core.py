import yaml
import os
import re
import ast
import json
import app.base.util as util

class DIPAM_RUNTIME:

    def __init__(
        self,
        dipam_config,
        dipam_units
    ):
        self.config = dipam_config
        self.units = dipam_units
        self.data = []
        self.tool = []
        self.param = []

    def create_new_data(self, c_name):
        runtime_index = self.get_runtime_index()
        runtime_index["data"] += 1
        d_unit = util.create_instance(
            self.units["data"][c_name],
            c_name,
            runtime_index["data"]
        )
        self.set_runtime_index(runtime_index)
        return d_unit

    def get_runtime_index(self):
        dir = self.config.get_config_value("dirs.dipam_runtime")
        with open(os.path.join(dir, "index.json"), 'r') as file:
            data = json.load(file)
        return data

    def set_runtime_index(self, runtime_index):
        dir = self.config.get_config_value("dirs.dipam_runtime")
        with open(os.path.join(dir, "index.json"), 'w') as json_file:
            json.dump(runtime_index, json_file, indent=4)


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

    def _extract_classes_from_file(self, file_path):
        """
        [LOCAL-METHOD]
        Extract all class names from a given Python file.
        """
        with open(file_path, 'r') as file:
            file_content = file.read()

        # Parse the Python file content using ast
        tree = ast.parse(file_content)

        # Get all the class names from the file
        class_names = [node.name for node in ast.walk(tree) if isinstance(node, ast.ClassDef)]

        return class_names

    def get_classes_in_dir(self, directory):
        """
        Go through all .py files in the directory and extract class names.
        """
        all_classes = dict()

        for filename in os.listdir(directory):
            if filename.endswith(".py"):
                file_path = os.path.join(directory, filename)
                class_names = self._extract_classes_from_file(file_path)
                for _c in class_names:
                    all_classes[_c] = directory + "/" +filename
        return all_classes


    def get_enabled_data_units(self):
        """
        :return: a list of all the DIPAM data units classes enabled (ready to be used)
        """
        dir = self.get_config_value("dirs.src_main")
        enabled_path = dir+"/data/enabled"
        return self.get_classes_in_dir(enabled_path)


    def get_tool_enabled_classes(self):
        dir = self.get_config_value("dirs.src_main")
        return self.get_classes_in_dir(dir+"/tool/enabled")

    def get_param_enabled_classes(self):
        dir = self.get_config_value("dirs.src_main")
        return self.get_classes_in_dir(dir+"/param/enabled")

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
