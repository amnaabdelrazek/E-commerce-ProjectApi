using E_commerce_Project.Data;
using E_commerce_Project.Models;
using E_commerce_Project.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace E_commerce_Project.Repositories.Implementations
{
    public class GenericRepository<T> : IGenericRepository<T> where T : BaseEntity
    {
        private readonly AppDbContext _context;
        private readonly DbSet<T> _db;

        public GenericRepository(AppDbContext context)
        {
            _context = context;
            _db = context.Set<T>();
        }

        // ================= GET ALL (WITH FILTER) =================
        public async Task<IEnumerable<T>> GetAllAsync(Expression<Func<T, bool>>? filter = null)
        {
            IQueryable<T> query = _db.Where(e => !e.IsDeleted);

            if (filter != null)
                query = query.Where(filter);

            return await query.ToListAsync();
        }

        // ================= GET BY ID =================
        public async Task<T?> GetByIdAsync(object id)
        {
            var entity = await _db.FindAsync(id);
            if (entity == null || entity.IsDeleted)
                return null;
            return entity;
        }

        // ================= FIRST OR DEFAULT =================
        public async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> filter)
        {
            return await _db.Where(e => !e.IsDeleted).FirstOrDefaultAsync(filter);
        }

        // ================= ADD =================
        public async Task AddAsync(T entity)
        {
            await _db.AddAsync(entity);
        }

        // ================= UPDATE =================
        public void Update(T entity)
        {
            _db.Update(entity);
        }

        // ================= DELETE =================
        public void Delete(T entity)
        {
            entity.IsDeleted = true;
            entity.DeletedAt = DateTime.UtcNow;
            Update(entity);
        }

        // ================= QUERYABLE (VERY IMPORTANT) =================
        public IQueryable<T> Query()
        {
            return _db.Where(e => !e.IsDeleted);
        }

        public async Task SaveAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}