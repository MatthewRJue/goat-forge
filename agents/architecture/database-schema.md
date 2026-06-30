The MVP should use this schema with a small seeded dataset.

The seed dataset is only for getting the first playable version working. It should contain representative real teams, eras, players, player versions, and ratings, but it does not need to be complete.

Future production data should be able to populate these same tables without requiring gameplay or UI rewrites.

For MVP, `player_attributes` stores the final playable rating for each MVP category. Future versions may add calculated values, manual adjustment values, source metadata, or additional categories after the full rating-generation system is needed.

---

```mermaid
erDiagram
    TEAMS ||--o{ PLAYER_VERSIONS : has
    ERAS ||--o{ PLAYER_VERSIONS : has
    PLAYERS ||--o{ PLAYER_VERSIONS : has
    PLAYER_VERSIONS ||--|| PLAYER_ATTRIBUTES : has

    TEAMS {
        uuid id PK
        string name
        string abbreviation
        string logo_url
    }

    ERAS {
        uuid id PK
        string label
        int start_year
        int end_year
    }

    PLAYERS {
        uuid id PK
        string name
        string position
        int height_inches
        int weight_lbs
        string image_url
    }

    PLAYER_VERSIONS {
        uuid id PK
        uuid player_id FK
        uuid team_id FK
        uuid era_id FK
        string label
        int season_start
        int season_end
    }

    PLAYER_ATTRIBUTES {
        uuid id PK
        uuid player_version_id FK
        int athleticism
        int shooting
        int finishing
        int playmaking
        int defense
    }
```
