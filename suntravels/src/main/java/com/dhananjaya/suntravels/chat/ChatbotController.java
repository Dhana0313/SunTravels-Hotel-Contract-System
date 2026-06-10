package com.dhananjaya.suntravels.chat;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:4200")
public class ChatbotController {

    private final ChatClient chatClient;

    // 1. We removed SearchService from the parameters here
    public ChatbotController(
            ChatClient.Builder chatClientBuilder,
            @Value("classpath:/prompts/system-rules.st") Resource systemPromptResource) {

        this.chatClient = chatClientBuilder
                .defaultSystem(systemPromptResource)
                // 2. We completely removed .defaultTools(searchService) here
                .build();
    }

    @PostMapping(value = "/ask", produces = "text/plain")
    public String askQuestion(@RequestBody String userMessage) {
        try {
            return chatClient.prompt()
                    .user(userMessage)
                    .call()
                    .content();
        } catch (Exception e) {
            e.printStackTrace();
            return "AI Connection Error: " + e.getMessage();
        }
    }
}