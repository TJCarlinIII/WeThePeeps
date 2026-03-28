// Add this to your main Admin/Dashboard data fetch
const liabilityQuery = `
  SELECT 
    a.full_name, 
    COUNT(r.id) as lie_count,
    MAX(i.is_critical) as has_critical_violation
  FROM actors a
  LEFT JOIN rebuttals r ON a.id = r.actor_id
  LEFT JOIN incidents i ON a.id = i.actor_id
  GROUP BY a.id
  ORDER BY lie_count DESC
`;