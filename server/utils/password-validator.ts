/**
 * Password Strength Validation
 * Enforces minimum security requirements for user passwords.
 */

export interface PasswordValidationResult {
    isValid: boolean;
    errors: string[];
}

/**
 * Validates password strength against security requirements.
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];

    if (!password || password.length < 8) {
        errors.push("Password must be at least 8 characters long");
    }

    if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
    }

    if (!/[0-9]/.test(password)) {
        errors.push("Password must contain at least one number");
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push("Password must contain at least one special character (!@#$%^&*...)");
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Returns a user-friendly description of password requirements.
 */
export function getPasswordRequirements(): string[] {
    return [
        "At least 8 characters long",
        "At least one uppercase letter (A-Z)",
        "At least one lowercase letter (a-z)",
        "At least one number (0-9)",
        "At least one special character (!@#$%^&*...)"
    ];
}
