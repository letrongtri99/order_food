let StoreReposistory = {
    generateSortField: (column: string, sortOrder: string): string => {
        let sortField: string;
        switch (column) {
            case 'name':
                sortField = `s.name ${sortOrder}`
                break;
            case 'count_order':
                sortField = `cs.count_order ${sortOrder}`
                break;
            default:
                sortField = `s.createdAt desc`
        }
        return sortField;
    }
}

export default StoreReposistory
