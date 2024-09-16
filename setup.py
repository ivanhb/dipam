import venv
import subprocess
import sys
import os
import shutil

INSTALL_DIR = "."

# Define the virtual environment directory and the list of libraries
src_dir = INSTALL_DIR + "/src"
app_dir = INSTALL_DIR + "/dipam"
venv_dir = app_dir+"/pyvenv"
libraries = [
    'requests',
    'flask',
    'zipfile36',
    'PyYAML'
    #'numpy==1.24.2',
    #'pandas==2.0.3'
]

def delete_directory_if_exists(directory):
    if os.path.exists(directory):
        shutil.rmtree(directory)

"""
Create a venv
"""
def create_venv(venv_dir):
    venv.create(venv_dir, with_pip=True)

"""
Installing libraries
"""
def install_libraries(venv_dir, libraries):
    print(f"[INFO] Installing libraries in virtual environment...")
    # Construct the path to the Python executable in the venv
    python_executable = os.path.join(venv_dir, 'Scripts', 'python') if os.name == 'nt' else os.path.join(venv_dir, 'bin', 'python')
    # Install each library using subprocess
    for lib in libraries:
        subprocess.check_call([python_executable, "-m", "pip", "install", lib])
    print(f"[INFO] Libraries installed: {', '.join(libraries)}")

"""
Deactivate venv
"""
def deactivate_venv():
    deactivate_command = 'deactivate'
    subprocess.run(deactivate_command, shell=True)


def create_app_script(install_dir):

    # Define the path for the generated script
    generated_script_path = install_dir+'/dipam.py'

    # Define the content of the generated script
    script_content = """
import subprocess
import os
import sys

# Define the virtual environment directory
venv_dir = '"""+venv_dir+"""'

# Construct the path to the Python executable in the venv
python_executable = os.path.join(venv_dir, 'Scripts', 'python') if os.name == 'nt' else os.path.join(venv_dir, 'bin', 'python')

# Define the path to the script to run
script_to_run = '"""+install_dir+"""/src/main.py'

def run_script():
    # Run the script using the Python interpreter from the virtual environment
    print(f"Running {script_to_run} with {python_executable}...")
    subprocess.check_call([python_executable, script_to_run])

if __name__ == "__main__":
    run_script()
    """
    # Write the content to the file
    #script_lines = [line.strip() for line in raw_script_content.strip().split('\n')]
    #script_content = '\n'.join(script_lines)
    with open(generated_script_path, 'w') as file:
        file.write(script_content)


def set_defaults(app_base, app_dir_runtime):
    # Copy workflow file of DIPAM
    source = os.path.join(app_base, "workflow.json")
    dest = os.path.join(app_dir_runtime, "workflow.json")
    shutil.copy(source,dest)

def main():

    if (3, 9) < sys.version_info < (3, 12):
        print(f"[INFO] Python version: OK")
    else:
        print(f"[ERROR] Python version not available or not compatible")
        return False

    # Delete main directory if exists
    print(f"[INFO] Deleting app if exists")
    delete_directory_if_exists(app_dir)

    # Create main dir
    dipam_path = os.path.expanduser(os.path.join(app_dir))
    if not os.path.exists(dipam_path):
        os.makedirs(os.path.join(app_dir, "log"))
        os.makedirs(os.path.join(app_dir, "data"))
        os.makedirs(os.path.join(app_dir, "runtime", "process-tmp"))
        os.makedirs(os.path.join(app_dir, "runtime", "tmp-d-write"))

    create_venv(venv_dir)
    print(f"[INFO] Create the virtual environment: OK")

    install_libraries(venv_dir, libraries)
    print(f"[INFO] Install libraries in the virtual environment: OK")

    deactivate_venv()
    print(f"[INFO] Deactivate the virtual environment: OK")

    create_app_script(INSTALL_DIR)
    print(f"[INFO] DIPAM app generated: OK")

    set_defaults(
        os.path.join(src_dir, "app", "base"),
        os.path.join(app_dir, "runtime")
    )
    print(f"[INFO] DIPAM defaults generated: OK")

if __name__ == "__main__":
    main()
