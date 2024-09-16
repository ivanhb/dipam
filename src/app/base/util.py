import importlib.util
import os

def create_instance(file_path, class_name, *args):
    """
    Create an instance of the specified class from a given file.

    Args:
        file_path (str): The file path to the Python file.
        class_name (str): The name of the class to instantiate.

    Returns:
        object: An instance of the specified class, or None if not found.
    """
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
