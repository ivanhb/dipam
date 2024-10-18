import importlib.util
import os
import shutil
import zipfile
import json
from pathlib import Path

def mkdir_at(path, name):
    dir_path = Path( os.path.join(path,name) )
    #remove it first, in case it already exists
    clear_directory(dir_path)
    dir_path.mkdir(parents=True, exist_ok=True)
    return dir_path

def mkjson_at(path, name, data):
    file_path = Path( os.path.join(path,name+".json") )
    #remove it first, in case it already exists
    if os.path.exists(file_path):
        os.remove(file_path)
    with open(file_path, 'w') as json_file:
        json.dump(data, json_file, indent=4)
    return file_path

def copy_dir_to(dir, dest_dir):
    """
    Copy a dir <dir> into a directory <dest_dir>
    """
    source_dir_name = dir.split(os.path.sep)[-1]
    dest_dir_full_path = os.path.join(dest_dir,source_dir_name)

    # in case it exists first remove it
    if os.path.exists(dest_dir_full_path):
        shutil.rmtree(dest_dir_full_path)

    shutil.copytree(
        dir,
        dest_dir_full_path
    )
    return dest_dir_full_path


def clear_directory(directory_path):
    """
    Remove all elements inside a given dirictory <directory_path>
    """
    # Iterate over all files and directories in the specified directory
    if os.path.exists(directory_path):
        for item in os.listdir(directory_path):
            item_path = os.path.join(directory_path, item)
            if os.path.isfile(item_path):
                # Remove the file
                os.remove(item_path)
            elif os.path.isdir(item_path):
                # Remove the directory and all its contents
                shutil.rmtree(item_path)
    return directory_path


def delete_path(path):
    """
    delete a dir <directory_path>
    """
    try:
        if os.path.exists(path):
            if os.path.isfile(path):
                os.remove(path)
                return True
            elif os.path.isdir(path):
                shutil.rmtree(path)
                return True
    except Exception as e:
        pass
    return False


def delete_file(f_path):
    """
    delete a file <f_path>
    """
    try:
        if os.path.isfile(f_path):
            os.remove(f_path)
            return True
    except:
        return False, "error", "The file <"+f_path+"> couldn't be removed"


"""
copy <source_f> to a directory <dest_dir>
"""
def f_copy(source_f, dest_dir):
    shutil.copy(
        source_f,
        os.path.join(dest_dir, source_f.split(os.path.sep)[-1])
    )

"""
zip a directory <dir_to_zip> and save it in <dest>
"""
def zipdir(dir_to_zip, dest_dir):

    TO_EXCLUDE = [".DS_Store"]

    # create zip handler
    zip_name = dir_to_zip.split(os.path.sep)[-1]
    zip_fullpath = os.path.join(dest_dir, zip_name+".zip")
    ziph = zipfile.ZipFile(
        zip_fullpath,
        'w',
        zipfile.ZIP_DEFLATED
    )

    # create and produce zip file to be saved in dest_dir
    for root, dirs, files in os.walk(dir_to_zip):
        for file in files:
            if file not in TO_EXCLUDE:
                abs_path = os.path.join(root, file)
                arcname = os.path.relpath(abs_path, start=dir_to_zip)
                ziph.write(abs_path,arcname)

        for dir in dirs:
            dir_path = os.path.join(root, dir)
            # Add directory path with a trailing slash
            empty_dir_arcname = os.path.relpath(dir_path, start=dir_to_zip) + '/'
            if not any(os.scandir(dir_path)):
                ziph.writestr(empty_dir_arcname, '')

    ziph.close()
    return zip_fullpath


"""
Create an instance of the specified class from a given file.

Args:
    file_path (str): The file path to the Python file.
    class_name (str): The name of the class to instantiate.

Returns:
    object: An instance of the specified class, or None if not found.
"""
def create_instance(file_path, class_name, *args):
    # Get the module name from the file path
    module_name = os.path.splitext(os.path.basename(file_path))[0]

    # Load the module dynamically
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    # Get the class from the module
    if hasattr(module, class_name):
        cls = getattr(module, class_name)
        # Create an instance of the class
        return cls(*args)
    else:
        print(f"Class {class_name} not found in {file_path}.")
        return None


def get_first_available_id(runtime_units, pref):
    """
    This methods returns the first available key to insert as new key in <data>;
    such that all keys in <data>, start with <pref> and have a sequential number after.
    @return:
        the new possible key
    E.G. <data> = {"d-1":1, "d-2":2, "d-4":4}, <pref> = "d-"; returns: "d-3"
    """
    _new_id = None
    _idx = 1
    while True:
        _new_id = pref+str(_idx)
        if _new_id not in runtime_units:
            break
        _idx += 1
    return _new_id


def replace_vars_in_file(self, unit_type, replacements):
    # Get the file path
    file_path = self.unit_base[unit_type]["view_fpath"]

    # Read the file content
    with open(file_path, 'r') as file:
        content = file.read()

    # Define a function to replace the variables
    def replace_match(match):
        # Extract the variable name without ${ and }
        var_name = match.group(1)
        # Return the corresponding value from the replacements dictionary, or keep it unchanged if not found
        return replacements.get(var_name, match.group(0))

    # Use a regular expression to find all ${<VAR>} patterns and replace them
    updated_content = re.sub(r'\$\{(\w+)\}', replace_match, content)

    return updated_content
