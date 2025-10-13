package com.miniproject.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TypingIndicator {
    private String chatRoomId;
    private String userId;
    private String userName;
    private boolean isTyping;
}
