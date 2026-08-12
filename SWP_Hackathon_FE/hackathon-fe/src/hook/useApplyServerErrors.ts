import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

export function applyServerErrors<T extends FieldValues>(
    errors: Record<string, string>,
    setError: UseFormSetError<T>
) {
    Object.entries(errors).forEach(([field, message]) => {
        setError(field as Path<T>, {
            type: "server",
            message,
        });
    });
}