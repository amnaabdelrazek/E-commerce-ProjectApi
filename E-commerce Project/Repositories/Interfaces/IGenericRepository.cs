using System.Linq.Expressions;

namespace E_commerce_Project.Repositories.Interfaces
{
    
        public interface IGenericRepository<T> where T : class
        {
            Task<IEnumerable<T>> GetAllAsync(Expression<Func<T, bool>>? filter = null);

            Task<T?> GetByIdAsync(object id);

            Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> filter);

            Task AddAsync(T entity);

            void Update(T entity);

            void Delete(T entity);

            IQueryable<T> Query();
            Task SaveAsync();
    }
    }

