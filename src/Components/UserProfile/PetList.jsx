import { Button } from "react-bootstrap";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Pet } from "../../models";

const PetList = ({ pets, onEdit, onDelete }) => {
  if (!pets || pets.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted mb-0">No pets added yet.</p>
      </div>
    );
  }

  return (
    <div className="pet-list">
      {pets.map((pet) => {
        const petModel = new Pet(pet);
        return (
          <div key={petModel.id} className="pet-card p-3 mb-3">
            <div className="d-flex align-items-center">
              <div className="ms-3 flex-grow-1">
                <h6 className="mb-1">{petModel.name}</h6>
                <small className="text-muted d-block">
                  {petModel.breed} • {petModel.age} years • {petModel.type}
                </small>
                {petModel.description && (
                  <small className="text-muted d-block mt-1">
                    {petModel.description}
                  </small>
                )}
              </div>
              <div className="d-flex flex-column gap-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => onEdit(petModel)}
                >
                  <FaPencilAlt />
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => onDelete(petModel.id)}
                >
                  <FaTrash />
                </Button>
              </div>
            </div>
            <hr />
          </div>
        );
      })}
    </div>
  );
};

export default PetList;
