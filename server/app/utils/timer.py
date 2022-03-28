import functools
import time


def use_timing(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.perf_counter()
        return_val = func(*args, **kwargs)
        duration = time.perf_counter() - start_time
        print(f">> {func.__name__} finished in : {duration} seconds")
        return return_val

    return wrapper
