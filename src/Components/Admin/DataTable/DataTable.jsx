import { useState, useEffect, useMemo } from "react";
import {
  FiChevronUp,
  FiChevronDown,
  FiEdit,
  FiTrash2,
  FiEye,
} from "react-icons/fi";
import "./DataTable.css";

/**
 * Reusable DataTable component for admin pages
 * @param {Object} props
 * @param {Array} props.data - Array of data objects
 * @param {Array} props.columns - Column configuration
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onDelete - Delete handler
 * @param {Function} props.onView - View handler
 * @param {boolean} props.loading - Loading state
 * @param {number} props.itemsPerPage - Items per page (default: 10)
 * @param {boolean} props.showActions - Show action buttons (default: true)
 * @param {Object} props.customActions - Custom action buttons
 */
const DataTable = ({
  data = [],
  columns = [],
  onEdit,
  onDelete,
  onView,
  loading = false,
  itemsPerPage = 10,
  showActions = true,
  customActions = null,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPageState, setItemsPerPageState] = useState(itemsPerPage);

  // Reset page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((item) => {
      return columns.some((column) => {
        if (column.searchable === false) return false;
        const value = column.accessor
          .split(".")
          .reduce((obj, key) => obj?.[key], item);
        return value
          ?.toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = sortConfig.key
        .split(".")
        .reduce((obj, key) => obj?.[key], a);
      const bValue = sortConfig.key
        .split(".")
        .reduce((obj, key) => obj?.[key], b);

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPageState);
  const startIndex = (currentPage - 1) * itemsPerPageState;
  const endIndex = startIndex + itemsPerPageState;
  const currentData = sortedData.slice(startIndex, endIndex);

  // Handlers
  const handleSort = (key) => {
    if (!key) return;

    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderCellValue = (item, column) => {
    const value = column.accessor
      .split(".")
      .reduce((obj, key) => obj?.[key], item);

    if (column.render) {
      return column.render(value, item);
    }

    return value ?? "-";
  };

  if (loading) {
    return (
      <div className="data-table-loading">
        <div className="spinner"></div>
        <p>Loading data...</p>
      </div>
    );
  }

  return (
    <div className="data-table-container">
      {/* Table Controls */}
      <div className="table-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            aria-label="Search table data"
          />
        </div>
        <div className="items-per-page">
          <label htmlFor="items-per-page">Show:</label>
          <select
            id="items-per-page"
            value={itemsPerPageState}
            onChange={(e) => {
              setItemsPerPageState(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="items-select"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="data-table" role="table">
          <thead>
            <tr role="row">
              {columns.map((column) => (
                <th
                  key={column.accessor}
                  onClick={() =>
                    column.sortable !== false && handleSort(column.accessor)
                  }
                  className={column.sortable !== false ? "sortable" : ""}
                  role="columnheader"
                  aria-sort={
                    sortConfig.key === column.accessor
                      ? sortConfig.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <div className="th-content">
                    <span>{column.header}</span>
                    {column.sortable !== false && (
                      <span className="sort-icon">
                        {sortConfig.key === column.accessor ? (
                          sortConfig.direction === "asc" ? (
                            <FiChevronUp />
                          ) : (
                            <FiChevronDown />
                          )
                        ) : (
                          <span className="sort-placeholder" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {showActions && <th className="actions-header">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((item, index) => (
                <tr key={item._id || index} role="row">
                  {columns.map((column) => (
                    <td key={column.accessor} role="cell">
                      {renderCellValue(item, column)}
                    </td>
                  ))}
                  {showActions && (
                    <td className="actions-cell" role="cell">
                      <div className="action-buttons">
                        {customActions ? (
                          customActions(item)
                        ) : (
                          <>
                            {onView && (
                              <button
                                onClick={() => onView(item)}
                                className="action-btn view"
                                title="View"
                                aria-label={`View ${item.name || "item"}`}
                              >
                                <FiEye />
                              </button>
                            )}
                            {onEdit && (
                              <button
                                onClick={() => onEdit(item)}
                                className="action-btn edit"
                                title="Edit"
                                aria-label={`Edit ${item.name || "item"}`}
                              >
                                <FiEdit />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => onDelete(item)}
                                className="action-btn delete"
                                title="Delete"
                                aria-label={`Delete ${item.name || "item"}`}
                              >
                                <FiTrash2 />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  className="no-data-cell"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="table-pagination">
          <div className="pagination-info">
            Showing {startIndex + 1}-{Math.min(endIndex, sortedData.length)} of{" "}
            {sortedData.length} entries
          </div>
          <div className="pagination-controls">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
              aria-label="Previous page"
            >
              Previous
            </button>
            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  return (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 2 && page <= currentPage + 2)
                  );
                })
                .map((page, index, array) => (
                  <span key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="pagination-ellipsis">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`pagination-number ${
                        currentPage === page ? "active" : ""
                      }`}
                      aria-label={`Go to page ${page}`}
                      aria-current={currentPage === page ? "page" : undefined}
                    >
                      {page}
                    </button>
                  </span>
                ))}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
