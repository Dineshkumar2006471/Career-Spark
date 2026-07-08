"""
Vector store service wrapper.
Phase 5 will read and write pgvector-backed document chunks through this module.
"""

# Describes the service and returns its provider name for diagnostics.
def provider_name() -> str:
    return "supabase-pgvector"
