const express = require('express')
const routes = express.Router()

const views = __dirname+'/views' 

Profile = {
    data: {
        name : 'Luan Oliveira',
        avatar: 'https://github.com/Luan9404.png',
        'monthly-budget' : 3000,
        'hours-per-day' : 5,
        'days-per-week' : 5,
        'vacation-per-year': 4,
        'hours-value': 75
    },
    controllers: {
        index(req,res){
            return res.render(views + "/profile",{profile: Profile.data})
        },

        update(req,res){
            const data = req.body;

            const weeksPerYear = 52;

            const weeksPerMouth = [weeksPerYear - data['vacation-per-year']]/12;

            const hoursPerWeek = data['hours-per-day'] * data['days-per-week'];

            const monthlyTotalHours = hoursPerWeek * weeksPerMouth;

            const hourValue = data['monthly-budget'] / monthlyTotalHours ;

            Profile.data = {
                ...Profile.data,
                ...req.body,
                'hours-value' : hourValue
            }

            res.redirect('/profile');

        },
    }

}

const Job = {
    data: [
        {
            id: 1,
            name: "Pizzaria Guloso",
            'total-hours': 1,
            'daily-hours': 2,
            created_at: Date.now(),

        },
        {
            id: 2,
            name: "OneTwo Project",
            'total-hours': 47,
            'daily-hours': 3,
            created_at: Date.now(),
        
        }
    ],
    controllers:{
        index(req, res){
            const updatedJobs = Job.data.map((job) => {
                const remaining = Job.services.remainingDays(job);
                const status = remaining <= 0 ? 'done' : 'progress';
                const jobBudget = Job.services.calculateBudget(job, Profile.data['hours-value'])
                
                return {
                    ...job,
                    remaining,
                    status,
                    budget : jobBudget,
                }
        
            })
            return res.render(views + "/index",{profile: Profile.data, jobs: updatedJobs})
        },
        save(req,res){
            const lastId = Job.data[Job.data.length - 1]?.id || 0;

            Job.data.push( {
                id: lastId +1,
                name: req.body.name,
                'daily-hours': req.body['daily-hours'],
                'total-hours': req.body['total-hours'],
                created_at: Date.now(),
            })
        return res.redirect('/');
        },
        create(req,res){
            return res.render(views + "/job")
        },
        show(req,res){
            const jobId = req.params.id;

            const job = Job.data.find(job => Number(job.id) === Number(jobId))

            if(!job){
                res.send('Error 404, job not found')
            }
            
            job.budget = Job.services.calculateBudget(job, Profile.data['hours-value']);

            return res.render(views + '/job-edit', {job})
        },
        update(req,res){
            const jobId = req.params.id;

            const job = Job.data.find(job => Number(job.id) === Number(jobId))

            if(!job){
                res.send('Error 404, job not found')
            }
            
            const updatedJob = {
                ...job,
                name: req.body.name,
                ['daily-hours']: req.body['daily-hours'],
                ['total-hours']: req.body['total-hours']
            } 

            Job.data = Job.data.map(job =>{
                if(Number(job.id) === Number(jobId)){
                    job = updatedJob;
                }
                return job
            })

            res.redirect('/job/'+jobId)
            

        },   
        delete(req,res){
            const jobId = req.params.id;

            Job.data = Job.data.filter(job => Number(job.id) !== Number(jobId))

            res.redirect('/')
        } 
    },
    services:{
        remainingDays(jobs){
            // calcula os dias restantes
            
            const remainingDays = (jobs['total-hours'] / jobs['daily-hours']).toFixed()
            const createdDate = new Date(jobs.created_at)  
            
            const dueDay = createdDate.getDate() + Number(remainingDays);
            
            const dueDateInMs = createdDate.setDate(dueDay);
        
            const timeDiffInMs = dueDateInMs - Date.now();
        
            const dayInMs = 1000 * 60 * 60 * 24;
        
            const dayDiff = Math.floor(timeDiffInMs / dayInMs);
            return dayDiff;
        },
        calculateBudget : (job, hourValue) => hourValue*job['total-hours'],
    }
}



routes.get('/', Job.controllers.index)
routes.get('/job',Job.controllers.create)
routes.post('/job', Job.controllers.save)
routes.get('/job/:id', Job.controllers.show)
routes.post('/job/:id', Job.controllers.update)
routes.post('/job/delete/:id', Job.controllers.delete)
routes.get('/profile', Profile.controllers.index)
routes.post('/profile', Profile.controllers.update)



module.exports = routes;