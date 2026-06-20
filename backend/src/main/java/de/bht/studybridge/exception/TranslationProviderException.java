package de.bht.studybridge.exception;

public class TranslationProviderException extends RuntimeException {

    public TranslationProviderException(String message) {
        super(message);
    }

    public TranslationProviderException(String message, Throwable cause) {
        super(message, cause);
    }
}
