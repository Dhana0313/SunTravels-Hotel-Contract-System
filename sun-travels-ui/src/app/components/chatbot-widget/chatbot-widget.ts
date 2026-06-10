import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-widget.html',
  styleUrl: './chatbot-widget.scss'
})
export class ChatbotWidgetComponent {
  private http = inject(HttpClient);

  // Using Angular Signals for modern state management
  isOpen = signal(false);
  isLoading = signal(false);
  userInput = signal('');
  
  // Start with a friendly greeting
  messages = signal<ChatMessage[]>([
    { sender: 'ai', text: 'Hi! I can help you search for hotel contracts. What are you looking for?' }
  ]);

  toggleChat() {
    this.isOpen.update(v => !v);
  }

  sendMessage() {
    const text = this.userInput().trim();
    if (!text) return;

    // 1. Add user message to the UI instantly
    this.messages.update(m => [...m, { sender: 'user', text }]);
    this.userInput.set('');
    this.isLoading.set(true);

    // 2. Send the message to your Spring Boot backend
    // (Ensure your Spring Boot controller is running on port 8080)
    this.http.post('http://localhost:8080/api/chat/ask', text, { responseType: 'text' })
      .subscribe({
        next: (response) => {
          this.messages.update(m => [...m, { sender: 'ai', text: response }]);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.messages.update(m => [...m, { sender: 'ai', text: 'Sorry, I encountered an error connecting to the backend.' }]);
          this.isLoading.set(false);
          console.error('Chat error:', err);
        }
      });
  }
}