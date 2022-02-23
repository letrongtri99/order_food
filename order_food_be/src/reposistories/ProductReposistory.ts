let ProductReposistory = {
    generateSortField: (column: string, sortOrder: string): string => {
        let sortField: string;
        switch (column) {
            case 'name':
                sortField = `p.name ${sortOrder}`
                break;
            default:
                sortField = `p.createdAt desc`
        }
        return sortField;
    }
}

export default ProductReposistory
