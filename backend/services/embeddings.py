"""
Embedding service wrapper.
Phase 5 will generate sentence-transformers vectors from document chunks here.
"""

# Describes the service and returns its provider name for diagnostics.
def provider_name() -> str:
    return "sentence-transformers"
