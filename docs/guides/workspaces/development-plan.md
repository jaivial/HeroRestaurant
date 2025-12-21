# Workspaces Feature Development Plan

This document outlines the roadmap for implementing the Workspaces feature in HeroRestaurant. In our ecosystem, a **Workspace** is equivalent to a **Restaurant**. The goal is to allow users with multiple restaurant memberships to switch between them seamlessly, updating the application context and data fetched via WebSockets.

---

## Sprint 1: Foundation & Navigation (The Switcher)

**Objective:** Enable users to see their available workspaces and switch between them.

### Backend Tasks
*   **Implement `restaurant.select` WebSocket Handler**: Create a new handler to update the `currentRestaurantId` in the connection state. This ensures the server knows which workspace context to use for subsequent requests.
*   **Enhance Restaurant Handlers**: Ensure `restaurant.list` returns all necessary metadata (logo, slug, role) for the switcher UI.

### Frontend Tasks
*   **Reusable WorkspaceSwitcher Component**: Develop a handmade, "Apple Aesthetic" combobox component. It must support searching, keyboard navigation, and display restaurant logos/names.
*   **Integration in TopHeader**: Place the `WorkspaceSwitcher` in the `TopHeader`. It will fetch the user's restaurants on load and update the global workspace state upon selection.
*   **URL-Driven Workspace Context**: Ensure that switching a workspace updates the URL route (e.g., from `/w/rest-1/dashboard` to `/w/rest-2/dashboard`), triggering a full context refresh.
*   **WebSocket Context Synchronization**: Automatically send the `restaurant.select` message to the server whenever the workspace state changes.

---

## Sprint 2: Workspace Area - Overview & Data Flow

**Objective:** Create a dedicated area for workspace-level information and ensure all pages respect the selected workspace.

### Frontend Tasks
*   **New Workspace Area Route**: Implement a new route (e.g., `/w/:workspaceId/workspace`) accessible from the Sidebar.
*   **Tabbed Interface**: Use a reusable Tabs component to switch between "Overview" and "Settings".
*   **Overview Tab Development**:
    *   Display high-level statistics: Number of active menus, total members, and recent activity.
    *   Implement "Quick Stats" cards using the glassmorphism style.
*   **Global Workspace Guard**: Ensure that if a user tries to access a workspace they don't belong to, they are redirected or shown an error.

---

## Sprint 3: Workspace Area - Settings & CRUD Operations

**Objective:** Allow authorized users to manage their workspace details entirely through WebSockets.

### Frontend Tasks
*   **Settings Tab Development**:
    *   Create a comprehensive form to edit restaurant details: Name, Slug, Description, Timezone, Currency, and Branding (Logo/Cover).
    *   Implement optimistic updates for a snappy user experience.
*   **WebSocket CRUD Integration**: Connect the Settings form to the `restaurant.update` WebSocket handler.
*   **Permissions Integration**: Hide or disable the Settings tab for users who do not have the `CAN_EDIT_SETTINGS` permission within that specific workspace.

### Backend Tasks
*   **Validation Refinement**: Ensure Zod schemas for restaurant updates are strict and prevent unauthorized slug changes or invalid data.
*   **Broadcasting Updates**: When a workspace is updated, broadcast the changes to all connected members of that workspace so their UI updates in real-time.

---

## Final Polish & Quality Assurance

*   **Responsive Review**: Verify the `WorkspaceSwitcher` and `WorkspaceArea` work perfectly on mobile devices using our 11-level breakpoint system.
*   **Theme Verification**: Ensure all new components look beautiful in both Light and Dark modes.
*   **Performance Audit**: Check that switching workspaces doesn't cause memory leaks or redundant WebSocket subscriptions.
*   **Documentation Update**: Update relevant guides to reflect the new workspace-centric navigation.
