package com.dhananjaya.suntravels.chat;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.*;
import com.dhananjaya.suntravels.search.SearchService; // Make sure this is imported!

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:4200")
public class ChatbotController {

    private final ChatClient chatClient;

    // Inject SearchService in the constructor
    public ChatbotController(ChatClient.Builder chatClientBuilder, SearchService searchService) {
        this.chatClient = chatClientBuilder
                .defaultSystem("You are a helpful travel assistant for Sun Travels. " +
                        "Use the searchHotelContracts tool to check real-time availability. " +
                        "Always be polite, summarize the hotel options clearly, and mention the prices.")
                // NEW API: Pass the actual service object!
                .defaultTools(searchService)
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
            // 1. Forces the full red error log into your IntelliJ console
            e.printStackTrace();
            // 2. Sends the exact cause directly to your chat widget screen
            return "AI Connection Error: " + e.getMessage();
        }
    }
}