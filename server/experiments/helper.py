def api_response(success=True, data=None, error=None):
    return {
        "success": success,
        "data": data,
        "error": error,
    }


def is_testing() -> bool:
    from django.conf import settings

    return settings.TESTING_MODE
