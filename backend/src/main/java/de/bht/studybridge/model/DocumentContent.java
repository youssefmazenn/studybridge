package de.bht.studybridge.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Raw bytes of an uploaded document, kept in its own table so listing/detail queries never load the
 * (potentially large) binary. Shares its primary key with {@link Document}. Storing the file in the
 * database keeps uploads durable on hosts with an ephemeral filesystem.
 */
@Entity
@Table(name = "document_contents")
public class DocumentContent {

    @Id
    @Column(name = "document_id")
    private Long documentId;

    @Column(name = "data", nullable = false)
    private byte[] data;

    public DocumentContent() {
    }

    public DocumentContent(Long documentId, byte[] data) {
        this.documentId = documentId;
        this.data = data;
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public byte[] getData() {
        return data;
    }

    public void setData(byte[] data) {
        this.data = data;
    }
}
