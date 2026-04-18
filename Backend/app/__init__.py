"""Package initialization for the API.

This module is executed whenever any submodule of ``app`` is imported.  We
use it to configure logging for third-party libraries before they have a
chance to emit noisy messages.

Specifically, ``passlib.handlers.bcrypt`` attempts to read the version of the
installed ``bcrypt`` module and will log a warning if it cannot.  That
warning is harmless but appears during *every* startup when bcrypt 5.0.0 is
installed, which is the case for the default requirements.  By lowering the
logger's level to ``ERROR`` here we silence the message globally.
"""

import logging

logging.getLogger("passlib.handlers.bcrypt").setLevel(logging.ERROR)
