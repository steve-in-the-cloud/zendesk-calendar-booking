# Web Widget vs Zendesk App Comparison

## Overview

This system provides two booking interfaces with different use cases:

| Feature | Web Widget | Zendesk App |
|---------|-----------|-------------|
| **User** | End customers | Customer service agents |
| **Context** | Zendesk Messaging conversation | Support ticket sidebar |
| **Booking Type** | Pre-selected via URL | Agent selects from dropdown |
| **Identifier** | `conversationId` | `ticketId` |
| **Message Posted** | Yes (to conversation) | No (agent-initiated) |
| **Access** | Public (via shared link) | Private (requires Zendesk login) |

## Web Widget (Conversation Extension)

### Purpose
Allow customers to self-book appointments during messaging conversations.

### User Flow
1. Customer chats with bot/agent
2. Bot/agent sends booking link (with specific booking type)
3. Customer clicks link → opens widget
4. Customer selects date/time
5. Booking confirmed → message posted to conversation

### URL Format
```
https://your-domain.com/?bookingTypeId=1&conversationId=abc123
```

### Key Characteristics
- **Booking type fixed**: Passed in URL (e.g., "Sales Demo")
- **Conversation context**: Customer initiated
- **Confirmation**: Message posted back to conversation
- **Use case**: Self-service booking during chat

### Integration
Zendesk Messaging → Conversation Extensions

### Example Scenario
> Customer: "I'd like to schedule a demo"
> 
> Bot: "Great! Click here to book your demo" [includes bookingTypeId=1]
> 
> Customer selects time
> 
> System: "✓ Your demo is scheduled for March 15 at 2:00 PM"

## Zendesk App (Ticket Sidebar)

### Purpose
Allow agents to book appointments on behalf of customers when handling tickets.

### User Flow
1. Agent opens support ticket
2. App appears in sidebar
3. Agent chooses booking type from dropdown
4. Agent selects date/time
5. Booking confirmed → linked to ticket

### Integration
Zendesk Support → Ticket Sidebar Apps

### Key Characteristics
- **Booking type selectable**: Agent chooses appropriate type
- **Ticket context**: Agent initiated
- **No conversation message**: Agent handles communication
- **Use case**: Agent-assisted booking during ticket resolution

### Example Scenario
> Ticket: "I need help setting up my account"
> 
> Agent: "I can schedule a call to walk you through setup"
> 
> Agent opens sidebar app, selects "Onboarding Call", picks time
> 
> Agent to customer: "I've scheduled a call for March 15 at 2:00 PM"

## Technical Differences

### Web Widget
```javascript
// URL Parameters
?bookingTypeId=1&conversationId=abc123

// API Request
POST /api/bookings
{
  bookingTypeId: 1,
  conversationId: "abc123",
  startTime: "2026-03-15T14:00:00Z",
  endTime: "2026-03-15T15:00:00Z"
}

// Backend Action
1. Create calendar event
2. Save to database
3. Post message to conversation ← Automatic
```

### Zendesk App
```javascript
// Context from ZAF SDK
client.get('ticket.id') → 12345

// API Request
POST /api/bookings
{
  bookingTypeId: 1,
  ticketId: "12345",
  startTime: "2026-03-15T14:00:00Z",
  endTime: "2026-03-15T15:00:00Z"
}

// Backend Action
1. Create calendar event
2. Save to database
3. No conversation message ← Agent communicates
```

## When to Use Each

### Use Web Widget When:
- ✓ Customers can self-select times
- ✓ Booking type is predetermined
- ✓ Automated confirmation message is desired
- ✓ Working with Zendesk Messaging
- ✓ Bot-initiated booking flow

### Use Zendesk App When:
- ✓ Agent needs to book on behalf of customer
- ✓ Multiple booking types are appropriate
- ✓ Agent wants control over confirmation message
- ✓ Working with Support tickets
- ✓ Human-assisted booking flow

## Database Records

Both create the same database record structure, just with different identifiers:

```sql
-- Web Widget Booking
INSERT INTO bookings VALUES (
  ...,
  conversation_id: 'abc123',
  ticket_id: NULL,
  ...
);

-- Zendesk App Booking
INSERT INTO bookings VALUES (
  ...,
  conversation_id: NULL,
  ticket_id: '12345',
  ...
);
```

## Combined Use Case

Many organizations use **both**:

- **Web Widget**: First-line self-service for simple bookings
- **Zendesk App**: Escalation path when agent intervention needed

Example flow:
1. Customer tries to book via web widget
2. No suitable times available
3. Customer creates ticket: "Can't find available time"
4. Agent uses sidebar app to check alternate dates
5. Agent books directly on behalf of customer

## Setup Requirements

### Web Widget
- Backend server running
- Conversation Extension configured in Zendesk Messaging
- Booking type IDs known for URL generation

### Zendesk App
- Backend server running
- App uploaded to Zendesk
- API URL configured in app settings
- No additional Zendesk configuration needed

Both require:
- Google Calendar configured
- Booking types created in admin panel
- CORS enabled for Zendesk domains
