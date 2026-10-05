import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button.jsx';
import Card from '@/components/ui/Card.jsx';
import PageHeading from '@/components/ui/PageHeading.jsx';
import { MESSAGES } from '@/constants/messages.js';
import VehicleCard from '@/features/vehicles/VehicleCard.jsx';
import VehicleForm from '@/features/vehicles/VehicleForm.jsx';
import {
  createVehicle,
  deleteVehicle,
  getVehicles,
  updateVehicle,
} from '@/services/vehicleService.js';
import './AdminVehiclesPage.css';

function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deletingVehicleId, setDeletingVehicleId] = useState(null);
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    getVehicles()
      .then((result) => {
        if (isCurrent) {
          setVehicles(result);
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setLoadError(error.message || MESSAGES.VEHICLES.ADMIN_LOAD_FAILED);
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [refreshVersion]);

  function startCreate() {
    setEditingVehicle(null);
    setActionError('');
    setSuccessMessage('');
    setShowForm(true);
  }

  function startEdit(vehicle) {
    setEditingVehicle(vehicle);
    setActionError('');
    setSuccessMessage('');
    setShowForm(true);
  }

  async function handleSave(vehicleData) {
    setActionError('');
    setSuccessMessage('');

    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, vehicleData);
        setSuccessMessage(MESSAGES.VEHICLES.ADMIN_UPDATED);
      } else {
        await createVehicle(vehicleData);
        setSuccessMessage(MESSAGES.VEHICLES.ADMIN_CREATED);
      }

      setShowForm(false);
      setEditingVehicle(null);
      setLoadError('');
      setIsLoading(true);
      setRefreshVersion((version) => version + 1);
    } catch (error) {
      setActionError(
        error.message ||
          (editingVehicle
            ? MESSAGES.VEHICLES.ADMIN_UPDATE_FAILED
            : MESSAGES.VEHICLES.ADMIN_CREATE_FAILED),
      );
    }
  }

  async function handleDelete(vehicle) {
    if (!window.confirm(MESSAGES.VEHICLES.ADMIN_CONFIRM_DELETE)) {
      return;
    }

    setDeletingVehicleId(vehicle.id);
    setActionError('');
    setSuccessMessage('');

    try {
      await deleteVehicle(vehicle.id);
      setSuccessMessage(MESSAGES.VEHICLES.ADMIN_DELETED);
      setLoadError('');
      setIsLoading(true);
      setRefreshVersion((version) => version + 1);
    } catch (error) {
      setActionError(error.message || MESSAGES.VEHICLES.ADMIN_DELETE_FAILED);
    } finally {
      setDeletingVehicleId(null);
    }
  }

  return (
    <div className="admin-vehicles-page">
      <PageHeading
        actions={
          <Button onClick={startCreate} type="button">
            {MESSAGES.VEHICLES.ADMIN_ADD}
          </Button>
        }
        breadcrumbs={[{ label: MESSAGES.VEHICLES.ADMIN_TITLE }]}
        description={MESSAGES.VEHICLES.ADMIN_DESCRIPTION}
        title={MESSAGES.VEHICLES.ADMIN_TITLE}
      />

      {actionError && <p role="alert">{actionError}</p>}
      {successMessage && <p role="status">{successMessage}</p>}

      {showForm && (
        <Card
          title={
            editingVehicle
              ? MESSAGES.VEHICLES.ADMIN_EDIT_TITLE
              : MESSAGES.VEHICLES.ADMIN_CREATE_TITLE
          }
        >
          <VehicleForm
            key={editingVehicle?.id ?? 'new-vehicle'}
            onCancel={() => setShowForm(false)}
            onSubmit={handleSave}
            submitLabel={
              editingVehicle
                ? MESSAGES.VEHICLES.ADMIN_UPDATE_SUBMIT
                : MESSAGES.VEHICLES.ADMIN_CREATE_SUBMIT
            }
            vehicle={editingVehicle ?? undefined}
          />
        </Card>
      )}

      {isLoading ? (
        <p role="status">{MESSAGES.COMMON.LOADING}</p>
      ) : loadError ? (
        <p role="alert">{loadError}</p>
      ) : vehicles.length === 0 ? (
        <p role="status">{MESSAGES.VEHICLES.ADMIN_EMPTY}</p>
      ) : (
        <ul className="admin-vehicles-page__list">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              deletingVehicleId={deletingVehicleId}
              onDelete={handleDelete}
              onEdit={startEdit}
              vehicle={vehicle}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminVehiclesPage;
