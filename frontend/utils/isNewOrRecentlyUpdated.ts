const isNewOrRecentlyUpdated = (createdAt: Date, updatedAt: Date | null): boolean => {
    
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000
    const isNew = createdAt.getTime() > Date.now() - ONE_WEEK_MS

    if (isNew) return true

    const recentlyUpdated = updatedAt
        ? updatedAt.getTime() > Date.now() - ONE_WEEK_MS
        : false
        
    return recentlyUpdated
}

export default isNewOrRecentlyUpdated
