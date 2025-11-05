import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { websitesAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Globe, Plus, Trash2, ExternalLink, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Websites = () => {
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [newWebsiteName, setNewWebsiteName] = useState('');
	const [newWebsiteDomain, setNewWebsiteDomain] = useState('');
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const { data: websites, isLoading } = useQuery('websites', websitesAPI.getAll, {
		select: (response) => response.data,
	});

	const createMutation = useMutation(
		(newWebsite) => websitesAPI.create(newWebsite),
		{
			onSuccess: (response) => {
				queryClient.invalidateQueries('websites');
				toast.success('Website added successfully');
				setIsAddModalOpen(false);
				setNewWebsiteName('');
				setNewWebsiteDomain('');
			},
			onError: (error) => {
				toast.error(
					`Failed to add website: ${error.response?.data?.error || error.message}`
				);
			},
		}
	);

	const deleteMutation = useMutation((id) => websitesAPI.delete(id), {
		onSuccess: () => {
			queryClient.invalidateQueries('websites');
			toast.success('Website deleted successfully');
		},
		onError: (error) => {
			toast.error(
				`Failed to delete website: ${error.response?.data?.error || error.message}`
			);
		},
	});

	const handleAddWebsite = () => {
		if (!newWebsiteName || !newWebsiteDomain) {
			toast.error('Please fill in all fields');
			return;
		}
		createMutation.mutate({ name: newWebsiteName, domain: newWebsiteDomain });
	};

	const handleDeleteWebsite = (id, name) => {
		if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
			deleteMutation.mutate(id);
		}
	};

	if (isLoading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<div className='loading-spinner w-8 h-8'></div>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
				<div>
					<h1 className='text-2xl font-bold text-gray-900'>Websites</h1>
					<p className='mt-1 text-sm text-gray-500'>
						Manage your tracked websites
					</p>
				</div>
				<button
					onClick={() => setIsAddModalOpen(true)}
					className='mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
				>
					<Plus className='h-5 w-5 mr-2' />
					Add Website
				</button>
			</div>

			{/* Websites Grid */}
			{websites && websites.length > 0 ? (
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
					{websites.map((website) => (
						<div
							key={website.id}
							className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow'
						>
							<div className='flex items-start justify-between'>
								<div className='flex-1'>
									<div className='flex items-center'>
										<div className='h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3'>
											<Globe className='h-6 w-6 text-primary-600' />
										</div>
										<div>
											<h3 className='text-lg font-medium text-gray-900'>
												{website.name}
											</h3>
											<p className='text-sm text-gray-500'>
												{website.domain}
											</p>
										</div>
									</div>
								</div>
								<button
									onClick={() =>
										handleDeleteWebsite(website.id, website.name)
									}
									className='text-gray-400 hover:text-red-600 transition-colors'
									title='Delete website'
								>
									<Trash2 className='h-5 w-5' />
								</button>
							</div>

							<div className='mt-4 pt-4 border-t border-gray-100 flex items-center justify-between'>
								<button
									onClick={() => navigate(`/website/${website.id}`)}
									className='inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700'
								>
									<BarChart3 className='h-4 w-4 mr-1' />
									View Analytics
								</button>
								<a
									href={`https://${website.domain}`}
									target='_blank'
									rel='noopener noreferrer'
									className='inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-700'
								>
									<ExternalLink className='h-4 w-4' />
								</a>
							</div>
						</div>
					))}
				</div>
			) : (
				<div className='text-center py-12 bg-white rounded-lg border border-gray-200'>
					<Globe className='mx-auto h-12 w-12 text-gray-400' />
					<h3 className='mt-2 text-sm font-medium text-gray-900'>
						No websites
					</h3>
					<p className='mt-1 text-sm text-gray-500'>
						Get started by adding your first website.
					</p>
					<button
						onClick={() => setIsAddModalOpen(true)}
						className='mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700'
					>
						<Plus className='h-5 w-5 mr-2' />
						Add Website
					</button>
				</div>
			)}

			{/* Add Website Modal */}
			{isAddModalOpen && (
				<div
					className='fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center'
					onClick={(e) => {
						if (e.target === e.currentTarget) {
							setIsAddModalOpen(false);
						}
					}}
				>
					<div className='bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl'>
						<h2 className='text-xl font-bold mb-4 text-gray-900'>
							Add New Website
						</h2>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								handleAddWebsite();
							}}
						>
							<div className='mb-4'>
								<label
									htmlFor='name'
									className='block text-sm font-medium text-gray-700'
								>
									Name
								</label>
								<input
									id='name'
									type='text'
									value={newWebsiteName}
									onChange={(e) => setNewWebsiteName(e.target.value)}
									className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 sm:text-sm px-3 py-2'
									placeholder='My Website'
									required
								/>
							</div>
							<div className='mb-4'>
								<label
									htmlFor='domain'
									className='block text-sm font-medium text-gray-700'
								>
									Domain
								</label>
								<input
									id='domain'
									type='text'
									value={newWebsiteDomain}
									onChange={(e) => setNewWebsiteDomain(e.target.value)}
									className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 sm:text-sm px-3 py-2'
									placeholder='example.com'
									required
								/>
							</div>
							<div className='flex justify-end gap-3'>
								<button
									type='button'
									onClick={() => setIsAddModalOpen(false)}
									className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50'
								>
									Cancel
								</button>
								<button
									type='submit'
									disabled={createMutation.isLoading}
									className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed'
								>
									{createMutation.isLoading ? 'Adding...' : 'Add Website'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default Websites;
