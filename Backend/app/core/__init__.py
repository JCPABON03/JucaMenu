# Make core a regular package and expose submodules for easy access
from . import security
from . import dependencies

__all__ = ["security", "dependencies"]
