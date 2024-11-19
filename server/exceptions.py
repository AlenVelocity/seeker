class LibraryException(Exception):
    pass

class ResourceNotFoundException(LibraryException):
    pass

class InvalidOperationException(LibraryException):
    pass

class ValidationException(LibraryException):
    pass 